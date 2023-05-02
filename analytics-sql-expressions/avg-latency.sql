SELECT
  intDiv(toUInt32(timestamp), 3600) * 3600 AS t,
  blob1 AS "path",
  blob2 AS "method",
  SUM(_sample_interval * double2) / SUM(_sample_interval) AS avg_latency
FROM
  'CF_WORKER_NAME' -- the name of the gateway
WHERE
  timestamp >= NOW() - INTERVAL '7' DAY
  AND double2 > 0
GROUP BY
  t,
  "path",
  "method"
ORDER BY
  t,
  avg_latency DESC