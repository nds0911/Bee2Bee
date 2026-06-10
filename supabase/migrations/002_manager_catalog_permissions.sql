-- Add manager permissions for managing IT products catalog

-- Allow managers to insert products
CREATE POLICY "Managers can insert products"
  ON it_products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

-- Allow managers to update products
CREATE POLICY "Managers can update products"
  ON it_products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

-- Allow managers to delete products
CREATE POLICY "Managers can delete products"
  ON it_products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );
