import { supabase, handleSupabaseError } from '../core/supabaseClient';

export const authService = {
    // Sign up with email and password
    async signUp(email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    // Sign out
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    // Reset password
    async resetPassword(email) {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    // Update password
    async updatePassword(newPassword) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    // Get user profile
    async getUserProfile() {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    // Update user profile
    async updateUserProfile(profileData) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .upsert(profileData)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    }
}; 