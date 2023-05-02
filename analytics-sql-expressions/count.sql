SELECT
  COUNT()
FROM
  'BINDING' -- the name of the binding
WHERE
  timestamp >= NOW() - INTERVAL '1' DAY
  AND double1 >= 400