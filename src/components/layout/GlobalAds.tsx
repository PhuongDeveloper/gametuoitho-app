'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function GlobalAds() {
  const [isVip, setIsVip] = useState(true); // Default to true to prevent ad flash on load
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_vip, role')
          .eq('id', user.id)
          .single();
          
        if (profile?.is_vip || profile?.role === 'admin') {
          setIsVip(true);
        } else {
          setIsVip(false);
        }
        if (profile?.role === 'admin') {
          setIsAdmin(true);
        }
      } else {
        setIsVip(false);
      }
    };
    checkUserStatus();
  }, [supabase]);

  useEffect(() => {
    if (!isVip && !isAdmin) {
      // Load Popunder
      const popunderScript = document.createElement('script');
      popunderScript.src = 'https://pl30417810.effectivecpmnetwork.com/83/45/80/83458029a6e8fac44e90c82951e2b900.js';
      popunderScript.type = 'text/javascript';
      document.body.appendChild(popunderScript);

      // Load SocialBar
      const socialBarScript = document.createElement('script');
      socialBarScript.src = 'https://pl30417809.effectivecpmnetwork.com/3c/15/68/3c1568356875792ab9ce06152a794111.js';
      socialBarScript.type = 'text/javascript';
      document.body.appendChild(socialBarScript);

      return () => {
        // Cleanup if user becomes VIP (though usually a full page reload happens)
        if (document.body.contains(popunderScript)) document.body.removeChild(popunderScript);
        if (document.body.contains(socialBarScript)) document.body.removeChild(socialBarScript);
      };
    }
  }, [isVip, isAdmin]);

  return null;
}
