-- Drop existing function and recreate with correct return type
DROP FUNCTION IF EXISTS cleanup_old_logs(INTEGER);

CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
  del_count BIGINT;
BEGIN
  DELETE FROM system_logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS del_count = ROW_COUNT;
  
  RETURN QUERY SELECT del_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;