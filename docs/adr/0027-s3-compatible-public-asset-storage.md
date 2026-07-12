# S3-compatible public Asset storage

External providers (fal) must download Product Assets by public HTTPS URL, so `STORAGE_TYPE=local` cannot feed Generation. We keep a single `IStorageService` and use `STORAGE_TYPE=s3` with an S3-compatible adapter (custom `AWS_ENDPOINT` + `forcePathStyle`, no object ACL) pointed at Supabase Storage, returning URLs from `AWS_PUBLIC_BASE_URL` (`…/object/public/<bucket>`). Rejected: a separate Supabase SDK provider, and re-uploading local files at Generation time.
