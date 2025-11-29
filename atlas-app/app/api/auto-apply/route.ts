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
    const { jobUrl, jobId, aiAnswers, autoSubmit = false } = body;

    if (!jobUrl) {
      return NextResponse.json({ error: 'Job URL required' }, { status: 400 });
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

    const result = await engine.applyToJob(jobUrl, profile, aiAnswers);

    if (result.status === 'filled' || result.status === 'submitted') {
      await supabase.from('applications').insert({
        user_id: user.id,
        opportunity_id: jobId || null,
        job_url: jobUrl,
        status: result.status === 'submitted' ? 'applied' : 'draft',
        application_data: {
          aiAnswers,
          fillResult: result.fillResult,
          autoApplied: true
        },
        applied_at: new Date().toISOString()
      });
    }

    await engine.close();

    return NextResponse.json({
      success: result.success,
      status: result.status,
      fieldsFilled: result.fillResult?.fieldsFilled || 0,
      fieldsTotal: result.fillResult?.fieldsTotal || 0,
      filledFields: result.fillResult?.filledFields || [],
      errors: result.fillResult?.errors || [],
      error: result.error
    });

  } catch (error) {
    console.error('Auto-apply error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Auto-apply failed' },
      { status: 500 }
    );
  }
}
