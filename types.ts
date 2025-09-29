export enum TransformationType {
    LINE_ART = 'LINE_ART',
    DEPTH_MAP = 'DEPTH_MAP',
    DESCRIPTION = 'DESCRIPTION',
    VARIATION = 'VARIATION',
    EXTRACTION_FORMAT = 'EXTRACTION_FORMAT',
    GRAPHIC_FORMAT = 'GRAPHIC_FORMAT',
}

export const TRANSFORMATION_MODELS: Record<TransformationType, string[]> = {
    [TransformationType.LINE_ART]: ['gemini-2.5-flash-image-preview'],
    [TransformationType.DEPTH_MAP]: ['gemini-2.5-flash-image-preview'],
    [TransformationType.VARIATION]: ['gemini-2.5-flash-image-preview', 'imagen-4.0-generate-001'],
    [TransformationType.DESCRIPTION]: ['gemini-2.5-flash'],
    [TransformationType.EXTRACTION_FORMAT]: ['gemini-2.5-flash'],
    [TransformationType.GRAPHIC_FORMAT]: ['gemini-2.5-flash'],
};