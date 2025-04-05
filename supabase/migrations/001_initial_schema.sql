-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.transactions enable row level security;
alter table public.user_profiles enable row level security;
alter table public.transfer_requests enable row level security;
alter table public.notifications enable row level security;

-- Create users table (extends auth.users)
create table public.users (
    id uuid references auth.users on delete cascade not null primary key,
    email text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    last_sign_in_at timestamp with time zone,
    is_onboarded boolean default false
);

-- Create user_profiles table
create table public.user_profiles (
    id uuid references public.users on delete cascade not null primary key,
    first_name text,
    last_name text,
    phone_number text,
    address text,
    city text,
    country text,
    postal_code text,
    date_of_birth date,
    id_document_type text,
    id_document_number text,
    id_document_verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table public.transactions (
    id uuid default uuid_generate_v4() primary key,
    sender_id uuid references public.users not null,
    receiver_id uuid references public.users not null,
    amount decimal(10,2) not null,
    currency text not null,
    status text not null,
    type text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transfer_requests table
create table public.transfer_requests (
    id uuid default uuid_generate_v4() primary key,
    sender_id uuid references public.users not null,
    receiver_id uuid references public.users not null,
    amount decimal(10,2) not null,
    currency text not null,
    status text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notifications table
create table public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users not null,
    type text not null,
    title text not null,
    message text not null,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index idx_transactions_sender_id on public.transactions(sender_id);
create index idx_transactions_receiver_id on public.transactions(receiver_id);
create index idx_transfer_requests_sender_id on public.transfer_requests(sender_id);
create index idx_transfer_requests_receiver_id on public.transfer_requests(receiver_id);
create index idx_notifications_user_id on public.notifications(user_id);

-- Create RLS Policies
create policy "Users can view their own data"
on public.users for select
to authenticated
using (auth.uid() = id);

create policy "Users can update their own data"
on public.users for update
to authenticated
using (auth.uid() = id);

create policy "Users can view their own profile"
on public.user_profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.user_profiles for update
to authenticated
using (auth.uid() = id);

create policy "Users can view their own transactions"
on public.transactions for select
to authenticated
using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can create transactions"
on public.transactions for insert
to authenticated
with check (auth.uid() = sender_id);

create policy "Users can view their own transfer requests"
on public.transfer_requests for select
to authenticated
using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can create transfer requests"
on public.transfer_requests for insert
to authenticated
with check (auth.uid() = sender_id);

create policy "Users can view their own notifications"
on public.notifications for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update their own notifications"
on public.notifications for update
to authenticated
using (auth.uid() = user_id);

-- Create functions
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.users (id, email)
    values (new.id, new.email);
    return new;
end;
$$;

-- Create trigger for new user creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user(); 