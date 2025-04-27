class HuggingFaceAIService {
    constructor(apiToken) {
        this.apiToken = apiToken;
        this.baseURL = 'https://api-inference.huggingface.co/models/';
        this.usedSubjectLines = new Set();
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    async generateSubjectLine(context) {
        this.retryCount = 0;
        return this.attemptSubjectLineGeneration(context);
    }

    async attemptSubjectLineGeneration(context) {
        try {
            const model = HUGGINGFACE_CONFIG.DEFAULT_MODEL.subjectLine;
            const prompt = this.createSubjectLinePrompt(context);
            
            const generatedText = await this.makeModelRequest(model, prompt);
            return this.processSubjectLines(generatedText, context);

        } catch (error) {
            console.error('Subject Line Generation Error:', error);

            // Retry mechanism
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`Retrying subject line generation (Attempt ${this.retryCount})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
                return this.attemptSubjectLineGeneration(context);
            }

            // Fallback to predefined subject lines
            return this.generateFallbackSubjectLines(context);
        }
    }

    createSubjectLinePrompt(context) {
        // Comprehensive mapping of business types to unique generation strategies
        const businessTypeStrategies = {
            'cafe_restaurant': {
                challenges: [
                    'increasing foot traffic',
                    'boosting customer loyalty',
                    'competing with delivery services'
                ],
                emotionalTriggers: [
                    'hunger for success',
                    'passion for culinary experience',
                    'entrepreneurial spirit'
                ],
                uniqueApproaches: [
                    'flavor revolution',
                    'dining transformation',
                    'customer experience reimagined'
                ]
            },
            'clothing_lifestyle': {
                challenges: [
                    'standing out in saturated market',
                    'connecting with digital consumers',
                    'building brand identity'
                ],
                emotionalTriggers: [
                    'style evolution',
                    'personal branding',
                    'fashion empowerment'
                ],
                uniqueApproaches: [
                    'wardrobe revolution',
                    'style redefined',
                    'fashion innovation'
                ]
            },
            'event_planner': {
                challenges: [
                    'attracting high-end clients',
                    'differentiating from competitors',
                    'managing complex logistics'
                ],
                emotionalTriggers: [
                    'dream event creation',
                    'memorable experience design',
                    'celebration engineering'
                ],
                uniqueApproaches: [
                    'event metamorphosis',
                    'celebration strategy',
                    'experience architecture'
                ]
            },
            'freelancer_creator': {
                challenges: [
                    'securing consistent clients',
                    'pricing services correctly',
                    'building professional reputation'
                ],
                emotionalTriggers: [
                    'creative potential',
                    'professional breakthrough',
                    'entrepreneurial freedom'
                ],
                uniqueApproaches: [
                    'creative disruption',
                    'talent amplification',
                    'professional reinvention'
                ]
            },
            'gym_fitness': {
                challenges: [
                    'member retention',
                    'digital fitness engagement',
                    'personalized wellness'
                ],
                emotionalTriggers: [
                    'transformation journey',
                    'peak performance',
                    'holistic wellness'
                ],
                uniqueApproaches: [
                    'fitness revolution',
                    'wellness redefined',
                    'performance breakthrough'
                ]
            },
            'default': {
                challenges: [
                    'business growth',
                    'market differentiation',
                    'competitive advantage'
                ],
                emotionalTriggers: [
                    'potential unleashed',
                    'strategic transformation',
                    'innovative breakthrough'
                ],
                uniqueApproaches: [
                    'business evolution',
                    'strategy reimagined',
                    'success redefined'
                ]
            }
        };

        // Select appropriate strategy or default
        const strategy = businessTypeStrategies[context.businessType] || businessTypeStrategies['default'];

        // Retain existing creative triggers and psychological approaches
        const creativeTriggers = [
            'curiosity',
            'urgency',
            'value',
            'challenge',
            'transformation'
        ];

        const psychologicalApproaches = [
            'Fear of Missing Out (FOMO)',
            'Social Proof',
            'Immediate Benefit',
            'Provocative Question',
            'Unexpected Solution'
        ];

        return `You are an elite AI copywriting strategist specializing in hyper-targeted, psychologically compelling subject lines.

        Precise Context:
        - Business Type: ${context.businessType}
        - Service: ${context.service}
        - Core Challenge: ${strategy.challenges[Math.floor(Math.random() * strategy.challenges.length)]}
        - Emotional Trigger: ${strategy.emotionalTriggers[Math.floor(Math.random() * strategy.emotionalTriggers.length)]}
        - Psychological Approach: ${psychologicalApproaches[Math.floor(Math.random() * psychologicalApproaches.length)]}
        - Creativity Trigger: ${creativeTriggers[Math.floor(Math.random() * creativeTriggers.length)]}

        Subject Line Generation Mandate:
        1. Create 3 completely unique subject lines
        2. Leverage the business's specific psychological landscape
        3. Trigger immediate curiosity and engagement
        4. Avoid generic business language
        5. Hint at transformative potential of ${context.service}

        Forbidden Techniques:
        - No direct service name mentions
        - Eliminate predictable business phrases
        - Avoid cliché marketing language
        - Maximum 45 characters

        Generation Framework:
        - Provoke curiosity
        - Suggest immediate value
        - Create an emotional hook
        - Imply a solution to ${strategy.challenges[0]}

        Unique Approach Inspiration: 
        ${strategy.uniqueApproaches[Math.floor(Math.random() * strategy.uniqueApproaches.length)]}

        Subject Line Archetypes:
        - Provocative Question
        - Unexpected Statistic
        - Bold Promise
        - Intriguing Metaphor
        - Counterintuitive Statement

        Tone: 
        - Sharp
        - Intelligent
        - Slightly Edgy
        - Professionally Disruptive

        Generate 3 breakthrough subject lines that would make a ${context.businessType} business owner stop and think:`;
    }

    async generateEmailContent(context) {
        this.retryCount = 0;
        return this.attemptEmailContentGeneration(context);
    }

    async attemptEmailContentGeneration(context) {
        try {
            const model = HUGGINGFACE_CONFIG.DEFAULT_MODEL.emailContent;
            const prompt = this.createEmailContentPrompt(context);
            
            const generatedText = await this.makeModelRequest(model, prompt);
            return this.cleanEmailContent(generatedText, context);

        } catch (error) {
            console.error('Email Content Generation Error:', error);

            // Retry mechanism
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`Retrying email content generation (Attempt ${this.retryCount})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
                return this.attemptEmailContentGeneration(context);
            }

            // Fallback to predefined email content
            return this.generateFallbackEmailContent(context);
        }
    }

    createEmailContentPrompt(context) {
        return `You are an expert copywriter creating a personalized, high-conversion cold email for a ${context.businessType} business.

        Detailed Context:
        - Recipient Name: ${context.recipientName}
        - Business Type: ${context.businessType}
        - Specific Service: ${context.service}
        - Portfolio Link: ${context.portfolioLinks}

        Email Composition Masterclass:
        1. Craft a hyper-personalized opening that demonstrates deep understanding of ${context.businessType} challenges
        2. Clearly articulate how ${context.service} solves specific pain points
        3. Use a conversational yet professional tone
        4. Highlight tangible, measurable benefits
        5. Incorporate social proof or quick win scenarios
        6. Create a compelling call-to-action

        Psychological Triggers to Include:
        - Address the specific challenges faced by ${context.businessType}
        - Show immediate value proposition
        - Create a sense of missed opportunity if they don't act
        - Demonstrate expertise through concise, impactful language

        Structural Guidelines:
        - Personalized greeting using recipient's name
        - 3-4 concise paragraphs
        - Each paragraph serves a specific purpose
        - Clear, action-oriented conclusion

        Tone: Professional, empathetic, and results-focused

        Generate an email that feels like a tailored solution, not a generic pitch:`;
    }

    async makeModelRequest(model, prompt) {
        try {
            const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 300,
                        temperature: 0.9,
                        top_k: 50,
                        top_p: 0.95
                    }
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('Detailed API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorBody
                });
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            return result[0]?.generated_text || 
                   result[0]?.text || 
                   result[0] || 
                   '';

        } catch (error) {
            console.error('Model Request Error:', error);
            throw error;
        }
    }

    processSubjectLines(generatedText, context) {
        // Advanced cleaning and processing with creative filtering
        const businessTypeKeywords = context.businessType.split('_').map(word => word.toLowerCase());
        const serviceKeywords = context.service.toLowerCase().split(' ');

        let lines = generatedText
            .split('\n')
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(line => {
                // Ensure line meets specific criteria
                const isValidLength = line.length > 15 && line.length < 50;
                const notContainsBusinessType = !businessTypeKeywords.some(keyword => 
                    line.toLowerCase().includes(keyword)
                );
                const notContainsService = !serviceKeywords.some(keyword => 
                    line.toLowerCase().includes(keyword)
                );
                const notGeneric = ![
                    'subject line', 'boost', 'transform', 'innovative', 
                    'solutions', 'digital', 'presence', 'business'
                ].some(word => line.toLowerCase().includes(word));

                return isValidLength && notContainsBusinessType && notContainsService && notGeneric;
            });

        // Sophisticated fallback mechanism
        const fallbackLines = [
            'Your Competitive Edge Unveiled',
            'The Strategy They Don\'t Want You to Know',
            'Rewrite Your Success Story',
            'Beyond Ordinary Expectations',
            'The Unexpected Breakthrough',
            'Your Silent Growth Weapon',
            'Disruption Starts Here',
            'The Game-Changing Approach'
        ];

        // Ensure 3 unique lines
        while (lines.length < 3) {
            const fallbackLine = fallbackLines[Math.floor(Math.random() * fallbackLines.length)];
            if (!lines.includes(fallbackLine)) {
                lines.push(fallbackLine);
            }
        }

        // Final processing
        lines = [...new Set(lines)]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        return lines.join('\n');
    }

    generateFallbackSubjectLine(context) {
        const fallbackLines = [
            `Boost Your ${context.businessType} Business`,
            `Innovative ${context.service} Solutions`,
            `Transform Your Digital Presence`,
            `Unlock Business Potential`,
            `Expert ${context.service} Strategies`
        ];

        return fallbackLines[Math.floor(Math.random() * fallbackLines.length)];
    }

    generateFallbackSubjectLines(context) {
        return [
            `Boost Your ${context.businessType} Business`,
            `Innovative ${context.service} Solutions`,
            `Transform Your Digital Presence`
        ].join('\n');
    }

    cleanEmailContent(text, context) {
        // Remove extra whitespace and trim
        text = text.trim();
        
        // Additional cleaning
        text = text.split('\n')
            .filter(line => line.trim() !== '')
            .join('\n');

        return text || this.generateFallbackEmailContent(context);
    }

    generateFallbackEmailContent(context) {
        return `Dear ${context.recipientName},

        I hope this email finds you well. I'm reaching out to discuss how our ${context.service} can help your ${context.businessType} business grow.

        My portfolio at ${context.portfolioLinks} showcases our successful projects and expertise.

        Would you be interested in a brief consultation to explore how we can drive your business forward?

        Best regards,
        [Your Name]`;
    }
}

// Initialize Hugging Face Service
let huggingFaceService;
try {
    huggingFaceService = new HuggingFaceAIService(getHuggingFaceToken());
} catch (error) {
    console.error('Failed to initialize Hugging Face Service:', error);
    
    // Fallback service
    huggingFaceService = {
        generateSubjectLine: (context) => {
            console.warn('Using fallback subject line generation');
            return Promise.resolve([
                `Boost Your ${context.businessType} Business`,
                `Innovative Solutions for ${context.service}`,
                `Transform Your Digital Presence`
            ].join('\n'));
        },
        generateEmailContent: (context) => {
            console.warn('Using fallback email content generation');
            return Promise.resolve(`Dear ${context.recipientName},

        I hope this email finds you well. I'm reaching out to discuss how our services can help your ${context.businessType} business grow.

        Best regards,
        [Your Name]`);
        }
    };
}