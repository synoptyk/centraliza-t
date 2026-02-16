// AI-Powered Test Analyzer for Psycholabor Responses
// Analyzes candidate responses and generates intelligent feedback

const PSYCHOLABOR_QUESTIONS = [
    {
        id: 1,
        question: "Describe una situación donde trabajaste en equipo para resolver un problema complejo. ¿Cuál fue tu rol y cómo contribuiste al resultado?",
        trait: 'teamwork',
        keywords: {
            positive: ['colabor', 'equipo', 'apoyo', 'comunica', 'coordinación', 'juntos', 'compartir', 'escuchar', 'consenso', 'cooperación'],
            negative: ['solo', 'individual', 'sin ayuda', 'no necesité', 'yo hice todo', 'no confío']
        }
    },
    {
        id: 2,
        question: "¿Cómo enfrentas situaciones de alta presión o conflictos laborales? Proporciona un ejemplo concreto.",
        trait: 'problemSolving',
        keywords: {
            positive: ['calma', 'analizar', 'solución', 'priorizar', 'organiz', 'planific', 'estrategia', 'resolver', 'enfoque', 'método'],
            negative: ['estrés', 'nervios', 'pánico', 'evito', 'no puedo', 'me bloqueo', 'renuncio']
        }
    },
    {
        id: 3,
        question: "Cuéntanos sobre una vez que tuviste que adaptarte rápidamente a un cambio importante en tu trabajo o entorno laboral.",
        trait: 'adaptability',
        keywords: {
            positive: ['adapt', 'flexib', 'aprend', 'cambio', 'nuevo', 'ajust', 'rápido', 'versátil', 'abierto', 'innovación'],
            negative: ['difícil', 'resistencia', 'no me gusta', 'prefiero lo mismo', 'no cambio', 'rutina']
        }
    },
    {
        id: 4,
        question: "Describe una situación donde tomaste la iniciativa sin que te lo pidieran. ¿Qué te motivó y cuál fue el resultado?",
        trait: 'leadership',
        keywords: {
            positive: ['iniciativa', 'proactiv', 'lider', 'propuse', 'organicé', 'motivé', 'responsabilidad', 'decisión', 'emprendí', 'guié'],
            negative: ['espero', 'me piden', 'sigo', 'no tomo', 'prefiero que otros', 'no me atrevo']
        }
    },
    {
        id: 5,
        question: "¿Qué harías si presencias una situación que va contra tus valores o la ética profesional en el trabajo?",
        trait: 'ethics',
        keywords: {
            positive: ['ética', 'valores', 'honestidad', 'integridad', 'reportar', 'hablar', 'correcto', 'transparencia', 'responsable', 'principios'],
            negative: ['ignorar', 'no es mi problema', 'callar', 'no me meto', 'depende', 'no importa']
        }
    }
];

const analyzeResponse = (response, questionData) => {
    const answer = response.answer.toLowerCase();
    const minLength = 50;

    let score = 0;
    let feedback = [];

    // 1. Length Analysis (0-30 points)
    if (answer.length < minLength) {
        score += 0;
        feedback.push('Respuesta muy breve, se esperaba mayor desarrollo');
    } else if (answer.length < 100) {
        score += 15;
        feedback.push('Respuesta aceptable pero podría ser más detallada');
    } else if (answer.length < 200) {
        score += 25;
        feedback.push('Buena extensión de respuesta');
    } else {
        score += 30;
        feedback.push('Respuesta muy completa y detallada');
    }

    // 2. Positive Keywords (0-40 points)
    let positiveCount = 0;
    questionData.keywords.positive.forEach(keyword => {
        if (answer.includes(keyword)) {
            positiveCount++;
        }
    });

    const positiveScore = Math.min(40, positiveCount * 8);
    score += positiveScore;

    if (positiveCount >= 3) {
        feedback.push('Excelente uso de conceptos clave');
    } else if (positiveCount >= 1) {
        feedback.push('Menciona algunos conceptos relevantes');
    } else {
        feedback.push('Podría incluir más conceptos específicos del área');
    }

    // 3. Negative Keywords (-20 points)
    let negativeCount = 0;
    questionData.keywords.negative.forEach(keyword => {
        if (answer.includes(keyword)) {
            negativeCount++;
        }
    });

    score -= negativeCount * 10;
    if (negativeCount > 0) {
        feedback.push('Se detectaron algunas expresiones que podrían mejorar');
    }

    // 4. Structure Analysis (0-30 points)
    const hasExample = answer.includes('ejemplo') || answer.includes('vez') || answer.includes('situación') || answer.includes('cuando');
    const hasResult = answer.includes('resultado') || answer.includes('logr') || answer.includes('consegu') || answer.includes('éxito');

    if (hasExample && hasResult) {
        score += 30;
        feedback.push('Respuesta bien estructurada con ejemplo y resultado');
    } else if (hasExample || hasResult) {
        score += 15;
        feedback.push('Incluye algunos elementos estructurales');
    }

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score));

    return {
        score,
        feedback: feedback.join('. ')
    };
};

const analyzeAllResponses = (responses) => {
    const traitScores = {
        teamwork: 0,
        problemSolving: 0,
        adaptability: 0,
        leadership: 0,
        ethics: 0
    };

    const strengths = [];
    const weaknesses = [];
    let totalScore = 0;

    // Analyze each response
    responses.forEach(response => {
        const questionData = PSYCHOLABOR_QUESTIONS.find(q => q.id === response.questionId);
        if (!questionData) return;

        const analysis = analyzeResponse(response, questionData);
        traitScores[questionData.trait] = analysis.score;
        totalScore += analysis.score;
    });

    // Calculate overall score
    const overallScore = Math.round(totalScore / responses.length);

    // Identify strengths and weaknesses
    Object.entries(traitScores).forEach(([trait, score]) => {
        const traitNames = {
            teamwork: 'Trabajo en Equipo',
            problemSolving: 'Resolución de Problemas',
            adaptability: 'Adaptabilidad',
            leadership: 'Liderazgo e Iniciativa',
            ethics: 'Ética Profesional'
        };

        if (score >= 70) {
            strengths.push(traitNames[trait]);
        } else if (score < 50) {
            weaknesses.push(traitNames[trait]);
        }
    });

    // Generate recommendations
    let recommendations = '';
    if (overallScore >= 80) {
        recommendations = 'Candidato altamente recomendado. Perfil sólido con competencias bien desarrolladas.';
    } else if (overallScore >= 60) {
        recommendations = 'Candidato apto con potencial. Se recomienda entrevista de seguimiento para profundizar en áreas específicas.';
    } else if (overallScore >= 40) {
        recommendations = 'Candidato con áreas de mejora significativas. Considerar capacitación o desarrollo antes de la contratación.';
    } else {
        recommendations = 'Candidato no cumple con el perfil esperado en esta evaluación. Se sugiere revisar otros aspectos del proceso.';
    }

    // Generate detailed feedback
    const detailedFeedback = `
Análisis Psicolaboral Completo:

PUNTUACIÓN GENERAL: ${overallScore}/100

FORTALEZAS IDENTIFICADAS:
${strengths.length > 0 ? strengths.map(s => `• ${s}`).join('\n') : '• No se identificaron fortalezas destacadas en esta evaluación'}

ÁREAS DE DESARROLLO:
${weaknesses.length > 0 ? weaknesses.map(w => `• ${w}`).join('\n') : '• No se identificaron debilidades significativas'}

PERFIL DE COMPETENCIAS:
• Trabajo en Equipo: ${traitScores.teamwork}/100
• Resolución de Problemas: ${traitScores.problemSolving}/100
• Adaptabilidad: ${traitScores.adaptability}/100
• Liderazgo e Iniciativa: ${traitScores.leadership}/100
• Ética Profesional: ${traitScores.ethics}/100

RECOMENDACIÓN:
${recommendations}

OBSERVACIONES ADICIONALES:
Las respuestas del candidato fueron analizadas considerando extensión, uso de conceptos clave, estructura y coherencia. 
Este análisis proporciona una evaluación objetiva basada en las competencias psicolaborales fundamentales.
    `.trim();

    return {
        overallScore,
        strengths,
        weaknesses,
        recommendations,
        detailedFeedback,
        personalityTraits: traitScores
    };
};

module.exports = {
    PSYCHOLABOR_QUESTIONS,
    analyzeAllResponses
};
