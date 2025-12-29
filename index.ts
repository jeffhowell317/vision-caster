import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.static('public'));

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth endpoints
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const callbackUrl = `${getBaseUrl()}/api/auth/callback`;
    console.log('Sending magic link with callback URL:', callbackUrl);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl
      }
    });

    if (error) throw error;
    res.json({ success: true, callbackUrl });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/debug', (req: Request, res: Response) => {
  const callbackUrl = `${getBaseUrl()}/api/auth/callback`;
  res.json({ 
    callbackUrl,
    instructions: `Add this URL to your Supabase project:
1. Go to your Supabase dashboard
2. Navigate to Authentication > URL Configuration
3. Add this to "Redirect URLs": ${callbackUrl}`
  });
});

app.get('/api/auth/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code as string);
      if (error) throw error;
      if (data.session) {
        // Set session token in cookie for client
        res.cookie('sb-auth-token', data.session.access_token, {
          httpOnly: false,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365
        });
        res.cookie('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365
        });
      }
    }
    res.redirect('/capture.html');
  } catch (error: any) {
    res.status(400).send('Authentication failed');
  }
});

app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({ user: data.user });
  } catch (error: any) {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('auth');
  res.json({ success: true });
});

// Captures endpoints
app.post('/api/captures', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data, error } = await supabase
      .from('captures')
      .insert({
        user_id: userData.user.id,
        raw_content: content,
        type: 'text'
      })
      .select();

    if (error) throw error;
    res.json({ capture: data?.[0] });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/captures', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data, error } = await supabase
      .from('captures')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ captures: data || [] });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Serve login page as root
app.get('/', (req: Request, res: Response) => {
  res.sendFile(process.cwd() + '/public/login.html');
});

function getBaseUrl(): string {
  const domain = process.env.REPLIT_DOMAINS || 'http://localhost:5000';
  return domain.startsWith('http') ? domain : `https://${domain}`;
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
