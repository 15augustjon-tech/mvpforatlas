import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAutoApplyEngine } from '@/lib/autoapply/autoApplyEngine';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobs, autoSubmit = false } = body;

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: 'Jobs array required' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const engine = getAutoApplyEngine({
      headless: true,
      autoSubmit,
      screenshotOnComplete: false
    });

    await engine.initialize();

    const results = await engine.applyToMultipleJobs(
      jobs.map((j: { url: string; aiAnswers?: Record<string, string> }) => ({ 
        url: j.url, 
        aiAnswers: j.aiAnswers 
      })),
      profile
    );

    const applicationsToInsert = results
      .filter(r => r.status === 'filled' || r.status === 'submitted')
      .map((r, i) => ({
        user_id: user.id,
        opportunity_id: jobs[i]?.id || null,
        job_url: r.jobUrl,
        status: r.status === 'submitted' ? 'applied' : 'draft',
        application_data: {
          fillResult: r.fillResult,
          autoApplied: true
        },
        applied_at: new Date().toISOString()
      }));

    if (applicationsToInsert.length > 0) {
      await supabase.from('applications').insert(applicationsToInsert);
    }

    await engine.close();

    const summary = {
      total: results.length,
      success: results.filter(r => r.success).length,
      filled: results.filter(r => r.status === 'filled').length,
      submitted: results.filter(r => r.status === 'submitted').length,
      errors: results.filter(r => r.status === 'error').length,
      captcha: results.filter(r => r.status === 'captcha').length,
      loginRequired: results.filter(r => r.status === 'login_required').length
    };

    return NextResponse.json({
      success: true,
      summary,
      results: results.map(r => ({
        jobUrl: r.jobUrl,
        status: r.status,
        fieldsFilled: r.fillResult?.fieldsFilled || 0,
        error: r.error
      }))
    });

  } catch (error) {
    console.error('Batch auto-apply error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Batch apply failed' },
      { status: 500 }
    );
  }
}
