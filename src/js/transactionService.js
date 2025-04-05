import { supabase, handleSupabaseError } from '../core/supabaseClient';

export const transactionService = {
    // Create a new transaction
    async createTransaction(transactionData) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert(transactionData)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    // Get all transactions for current user
    async getTransactions() {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    // Get transaction by ID
    async getTransactionById(id) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    // Create a transfer request
    async createTransferRequest(requestData) {
        try {
            const { data, error } = await supabase
                .from('transfer_requests')
                .insert(requestData)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    // Get all transfer requests for current user
    async getTransferRequests() {
        try {
            const { data, error } = await supabase
                .from('transfer_requests')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    // Update transfer request status
    async updateTransferRequestStatus(id, status) {
        try {
            const { data, error } = await supabase
                .from('transfer_requests')
                .update({ status })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    }
}; 