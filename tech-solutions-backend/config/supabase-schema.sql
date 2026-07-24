-- ==========================================================
-- ORDERS TABLE
-- Run this in the Supabase SQL editor.
-- ==========================================================

create table if not exists orders (
    id                          uuid primary key default gen_random_uuid(),
    tracking_id                 text not null unique,

    customer_name               text not null,
    customer_phone              text not null,
    customer_email              text not null,
    county                      text,
    town                        text,
    address                     text,
    landmark                    text,
    notes                       text,

    cart                        jsonb not null,
    subtotal                    numeric not null default 0,
    delivery_fee                numeric not null default 0,
    total                       numeric not null default 0,

    status                      text not null default 'Pending Payment',
    shipment_status             text not null default 'In Store',
    payment_status              text not null default 'pending', -- pending | completed | failed

    mpesa_checkout_request_id   text,
    mpesa_merchant_request_id   text,
    mpesa_receipt               text,
    amount_paid                 numeric,

    created_at                  timestamptz not null default now(),
    updated_at                  timestamptz not null default now()
);

-- Speeds up the STK Push status-poll lookups
create index if not exists idx_orders_checkout_request_id
    on orders (mpesa_checkout_request_id);

-- Speeds up the Track Order page lookups
create index if not exists idx_orders_tracking_id
    on orders (tracking_id);

-- Keep updated_at current on every row change
create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_orders_updated_at on orders;

create trigger trg_orders_updated_at
before update on orders
for each row execute function set_updated_at();