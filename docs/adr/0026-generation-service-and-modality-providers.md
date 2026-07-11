# Generation uses one app seam and modality-specific providers

The primary application seam is IGenerationService (evolved from the current generator service). Video keeps IVideoGenerationProvider; text and optional AI Post images use new ITextGenerationProvider and IImageGenerationProvider. A single mega AI port and stuffing text into the video port were rejected so providers stay swappable and tests stay focused.
