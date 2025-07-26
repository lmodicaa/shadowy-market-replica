-- Simple version of payment proof enhancement for PIX orders
-- Execute this SQL in Supabase SQL Editor to add payment proof support

-- Add new columns for payment proof functionality
ALTER TABLE pix_orders 
ADD COLUMN IF NOT EXISTS payment_proof_file TEXT,
ADD COLUMN IF NOT EXISTS payment_proof_filename VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_proof_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'waiting_payment',
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_review_notes TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_pix_orders_payment_status ON pix_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_pix_orders_user_payment_status ON pix_orders(user_id, payment_status);

-- Update existing orders to have correct payment status
UPDATE pix_orders 
SET payment_status = CASE 
    WHEN status = 'pagado' THEN 'approved'
    WHEN status = 'pendiente' THEN 'waiting_payment'
    WHEN status = 'cancelado' THEN 'rejected'
    ELSE 'waiting_payment'
END
WHERE payment_status IS NULL OR payment_status = 'waiting_payment';

-- Enhanced RLS policies for payment proof functionality
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Users can insert their own pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Users can update their own pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Admins can view all pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Admins can update all pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Admins can delete all pix orders" ON pix_orders;

-- Create comprehensive RLS policies
-- Users can view their own orders
CREATE POLICY "Users can view their own pix orders" ON pix_orders
    FOR SELECT USING (auth.uid()::text = user_id);

-- Users can create new orders
CREATE POLICY "Users can insert their own pix orders" ON pix_orders
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own orders (for payment proof upload)
CREATE POLICY "Users can update their own pix orders for payment proof" ON pix_orders
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all pix orders" ON pix_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()::text
        )
    );

-- Admins can update all orders (for review and management)
CREATE POLICY "Admins can update all pix orders" ON pix_orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()::text
        )
    );

-- Admins can delete orders
CREATE POLICY "Admins can delete all pix orders" ON pix_orders
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()::text
        )
    );

-- Ensure RLS is enabled
ALTER TABLE pix_orders ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE pix_orders IS 'Enhanced PIX orders table with payment proof upload and admin review functionality';
COMMENT ON COLUMN pix_orders.payment_proof_file IS 'Base64 encoded payment proof file (image or PDF)';
COMMENT ON COLUMN pix_orders.payment_proof_filename IS 'Original filename of the uploaded proof';
COMMENT ON COLUMN pix_orders.payment_proof_type IS 'MIME type of the uploaded file';
COMMENT ON COLUMN pix_orders.payment_status IS 'Payment status: waiting_payment, waiting_review, approved, rejected';
COMMENT ON COLUMN pix_orders.payment_confirmed_at IS 'Timestamp when client uploaded payment proof';
COMMENT ON COLUMN pix_orders.admin_reviewed_at IS 'Timestamp when admin reviewed the payment proof';
COMMENT ON COLUMN pix_orders.admin_review_notes IS 'Admin notes about the payment review (especially for rejections)';