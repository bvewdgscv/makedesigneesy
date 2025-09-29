export enum TransformationType {
    TEXT_TO_IMAGE = 'TEXT_TO_IMAGE',
    LINE_ART = 'LINE_ART',
    RELIEF_MODEL = 'RELIEF_MODEL',
    DESCRIPTION = 'DESCRIPTION',
    VARIATION = 'VARIATION',
    LOGO = 'LOGO',
    EXTRACTION_FORMAT = 'EXTRACTION_FORMAT',
    GRAPHIC_FORMAT = 'GRAPHIC_FORMAT',
    CLARITY_BOOST = 'CLARITY_BOOST',
    PATTERNIZE = 'PATTERNIZE',
    GEOMETRIZE = 'GEOMETRIZE',
}

export const TRANSFORMATION_MODELS: Record<TransformationType, string[]> = {
    [TransformationType.TEXT_TO_IMAGE]: ['imagen-4.0-generate-001'],
    [TransformationType.LINE_ART]: ['gemini-2.5-flash-image-preview'],
    [TransformationType.RELIEF_MODEL]: ['gemini-2.5-flash-image-preview'],
    [TransformationType.VARIATION]: ['gemini-2.5-flash-image-preview', 'imagen-4.0-generate-001'],
    [TransformationType.LOGO]: ['gemini-2.5-flash-image-preview'],
    [TransformationType.DESCRIPTION]: ['gemini-2.5-flash'],
    [TransformationType.EXTRACTION_FORMAT]: ['gemini-2.5-flash'],
    [TransformationType.GRAPHIC_FORMAT]: ['gemini-2.5-flash'],
    [TransformationType.CLARITY_BOOST]: ['gemini-2.5-flash-image-preview'],
    [TransformationType.PATTERNIZE]: ['gemini-2.5-flash-image-preview'],
    [TransformationType.GEOMETRIZE]: ['gemini-2.5-flash-image-preview'],
};