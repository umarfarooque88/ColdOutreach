// ai-config.js
const HUGGINGFACE_CONFIG = {
    API_TOKEN: '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',
    DEFAULT_MODEL: {
        subjectLine: 'deepseek-ai/DeepSeek-R1',  // DeepSeek model
        emailContent: 'deepseek-ai/DeepSeek-R1'  // Same model for email content
    },
    ALTERNATIVE_MODELS: {
        subjectLine: [
            'deepseek-ai/DeepSeek-R1',
            // 'mistralai/Mixtral-8x7B-Instruct-v0.1',
            // 'meta-llama/Llama-2-70b-chat-hf'
        ],
        emailContent: [
            'deepseek-ai/DeepSeek-R1',
            // 'microsoft/Orca-2-13b',
            // 'google/flan-ul2'
        ]
    },
    API_ENDPOINTS: {
        TEXT_GENERATION: 'https://api-inference.huggingface.co/models/',
        CONVERSATIONAL: 'https://api-inference.huggingface.co/models/conversational'
    },
    GENERATION_PARAMETERS: {
        maxTokens: 250,
        temperature: 0.7,
        topK: 50,
        topP: 0.95
    }
};

// Secure token storage and retrieval
function getHuggingFaceToken() {
    return HUGGINGFACE_CONFIG.API_TOKEN;
}

// Model selection utility
function selectAlternativeModel(type) {
    const models = HUGGINGFACE_CONFIG.ALTERNATIVE_MODELS[type];
    const randomIndex = Math.floor(Math.random() * models.length);
    return models[randomIndex];
}

// Error logging utility
function logAIError(error, context) {
    console.group('Hugging Face AI Error');
    console.error('Error:', error);
    console.error('Context:', context);
    console.groupEnd();
}

// Configuration validation
function validateAIConfig() {
    const config = HUGGINGFACE_CONFIG;
    
    // Check API Token
    if (!config.API_TOKEN || config.API_TOKEN.trim() === '') {
        console.error('Invalid Hugging Face API Token');
        return false;
    }

    // Validate default models
    const validateModel = (modelName) => {
        return modelName && 
               typeof modelName === 'string' && 
               modelName.includes('/');
    };

    if (!validateModel(config.DEFAULT_MODEL.subjectLine)) {
        console.error('Invalid Subject Line Model');
        return false;
    }

    if (!validateModel(config.DEFAULT_MODEL.emailContent)) {
        console.error('Invalid Email Content Model');
        return false;
    }

    return true;
}

// Initialize and validate configuration
function initializeAIConfiguration() {
    if (!validateAIConfig()) {
        console.error('AI Configuration Validation Failed');
        return false;
    }

    console.log('Hugging Face AI Configuration Validated Successfully');
    return true;
}

// Run initialization on script load
initializeAIConfiguration();