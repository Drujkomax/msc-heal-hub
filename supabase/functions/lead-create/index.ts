import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botJwt = Deno.env.get('BOT_BACKEND_JWT');
    if (!botJwt) {
      throw new Error('BOT_BACKEND_JWT not configured');
    }

    // Verify bot authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== botJwt) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    
    // Support multiple field names for flexibility
    const name = (body.name || body.full_name || body.fio || '').toString().trim();
    const phone = (body.phone || body.phone_number || '').toString().trim();

    if (!name || !phone) {
      return new Response(JSON.stringify({ error: 'Name and phone are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Input validation
    if (name.length > 100) {
      return new Response(JSON.stringify({ error: 'Name too long (max 100 chars)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Phone format validation (international format)
    const phoneRegex = /^\+?[1-9]\d{6,14}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return new Response(JSON.stringify({ error: 'Invalid phone format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const email = body.email ? body.email.toString().trim() : null;
    const company = body.company ? body.company.toString().trim() : null;
    const source = body.source || 'tg_bot';
    const notes = body.notes ? body.notes.toString().trim() : null;

    // Email format validation if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 255) {
        return new Response(JSON.stringify({ error: 'Invalid email format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Length validation for optional fields
    if (company && company.length > 200) {
      return new Response(JSON.stringify({ error: 'Company name too long (max 200 chars)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (notes && notes.length > 1000) {
      return new Response(JSON.stringify({ error: 'Notes too long (max 1000 chars)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name,
        phone,
        email,
        company,
        source,
        stage: 'new',
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Lead created: ${lead.id} via tg_bot`);

    return new Response(JSON.stringify({ ok: true, id: lead.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in lead-create:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
