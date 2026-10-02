# RLS Access Matrix

This is the **target** matrix. Baseline deviations are findings, not intended authorization.

Legend: R=select, C=insert, U=update, D=delete, `self`=own row, `pub`=published public row, `admin`=server-verified admin.

| Resource | anon | authenticated A | authenticated B vs A row | admin |
|---|---|---|---|---|
| profiles | - | R/U self | - | R/U |
| contents | R pub | R pub; C/U/D own | R pub only | R/C/U/D |
| polls | R open/public | R | R | R/C/U/D |
| votes | - | C own; R own/result-safe view | cannot mutate A | R |
| user_events | C limited anon event | C own/session | no raw cross-user R | R via privileged export |
| admin_notes | - | - | - | R/C/U/D |
| storage content-images | R published | C/U/D own path | cannot write A path | R/C/U/D |
| privileged RPC | - | only non-admin RPC | - | admin-only export/admin RPC |
