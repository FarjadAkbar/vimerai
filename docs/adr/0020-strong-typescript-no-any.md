# Strong TypeScript: no `any`; shared types live in types folders

Application TypeScript must not use `any`. Domain and API shapes are defined as named types/interfaces in dedicated `types` folders (not inline ad-hoc objects or loose casts). Prefer precise unions, generics, and unknown+narrowing at boundaries. Chosen to keep the modular multi-provider codebase navigable and safe as Brand Kit, Generation, and provider adapters grow.
