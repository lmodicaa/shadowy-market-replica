-- Enhancement to PIX orders table for payment proof upload functionality
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
    FOR UPDATE USING (
        auth.uid()::text = user_id AND 
        (payment_status = 'waiting_payment' OR payment_status IS NULL)
    )
    WITH CHECK (
        auth.uid()::text = user_id AND
        -- Only allow updating payment proof fields
        (
            OLD.id = NEW.id AND
            OLD.user_id = NEW.user_id AND
            OLD.amount = NEW.amount AND
            OLD.status = NEW.status
        )
    );

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

-- Create a function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_payment_proof_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- If payment_proof_file is being added for the first time
    IF OLD.payment_proof_file IS NULL AND NEW.payment_proof_file IS NOT NULL THEN
        NEW.payment_confirmed_at = NOW();
        NEW.payment_status = 'waiting_review';
    END IF;
    
    -- If payment status is being changed by admin
    IF OLD.payment_status != NEW.payment_status AND 
       (NEW.payment_status = 'approved' OR NEW.payment_status = 'rejected') THEN
        NEW.admin_reviewed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS trigger_update_payment_proof_timestamp ON pix_orders;
CREATE TRIGGER trigger_update_payment_proof_timestamp
    BEFORE UPDATE ON pix_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_proof_timestamp();

-- Create a view for admin dashboard with payment statistics
CREATE OR REPLACE VIEW admin_payment_stats AS
SELECT 
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE payment_status = 'waiting_payment') as waiting_payment,
    COUNT(*) FILTER (WHERE payment_status = 'waiting_review') as waiting_review,
    COUNT(*) FILTER (WHERE payment_status = 'approved') as approved,
    COUNT(*) FILTER (WHERE payment_status = 'rejected') as rejected,
    SUM(CASE WHEN payment_status = 'approved' THEN amount::numeric ELSE 0 END) as total_approved_amount,
    COUNT(*) FILTER (WHERE payment_confirmed_at >= NOW() - INTERVAL '24 hours') as proofs_uploaded_today,
    COUNT(*) FILTER (WHERE admin_reviewed_at >= NOW() - INTERVAL '24 hours') as reviewed_today
FROM pix_orders;

-- Grant access to the view for admins
GRANT SELECT ON admin_payment_stats TO authenticated;

COMMENT ON TABLE pix_orders IS 'Enhanced PIX orders table with payment proof upload and admin review functionality';
COMMENT ON COLUMN pix_orders.payment_proof_file IS 'Base64 encoded payment proof file (image or PDF)';
COMMENT ON COLUMN pix_orders.payment_proof_filename IS 'Original filename of the uploaded proof';
COMMENT ON COLUMN pix_orders.payment_proof_type IS 'MIME type of the uploaded file';
COMMENT ON COLUMN pix_orders.payment_status IS 'Payment status: waiting_payment, waiting_review, approved, rejected';
COMMENT ON COLUMN pix_orders.payment_confirmed_at IS 'Timestamp when client uploaded payment proof';
COMMENT ON COLUMN pix_orders.admin_reviewed_at IS 'Timestamp when admin reviewed the payment proof';
COMMENT ON COLUMN pix_orders.admin_review_notes IS 'Admin notes about the payment review (especially for rejections)';