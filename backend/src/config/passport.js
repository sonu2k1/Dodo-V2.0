const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./env');
const { supabaseAdmin } = require('./database');

/**
 * Configure Google OAuth 2.0 Strategy
 */
passport.use(
    new GoogleStrategy(
        {
            clientID: config.google.clientId,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackUrl,
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const googleId = profile.id;
                const fullName = profile.displayName;
                const avatarUrl = profile.photos?.[0]?.value;

                if (!email) {
                    return done(new Error('No email provided by Google'), null);
                }

                // Check if user exists by Google ID or email
                let { data: existingUser, error: fetchError } = await supabaseAdmin
                    .from('users')
                    .select('*')
                    .or(`google_id.eq.${googleId},email.eq.${email}`)
                    .single();

                if (fetchError && fetchError.code !== 'PGRST116') {
                    // PGRST116 = no rows found
                    return done(fetchError, null);
                }

                let user;

                if (existingUser) {
                    // Update existing user with Google info if needed
                    const { data: updatedUser, error: updateError } = await supabaseAdmin
                        .from('users')
                        .update({
                            google_id: googleId,
                            avatar_url: avatarUrl || existingUser.avatar_url,
                            email_verified: true,
                            last_login_at: new Date().toISOString(),
                        })
                        .eq('id', existingUser.id)
                        .select()
                        .single();

                    if (updateError) {
                        return done(updateError, null);
                    }
                    user = updatedUser;
                } else {
                    // Create new user (default role: employee, can be changed by admin)
                    const { data: newUser, error: createError } = await supabaseAdmin
                        .from('users')
                        .insert({
                            email,
                            google_id: googleId,
                            full_name: fullName,
                            avatar_url: avatarUrl,
                            role: 'employee', // Default role
                            email_verified: true,
                            is_active: true,
                            last_login_at: new Date().toISOString(),
                        })
                        .select()
                        .single();

                    if (createError) {
                        return done(createError, null);
                    }
                    user = newUser;
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialize user for session (if using sessions)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return done(error, null);
        }
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
