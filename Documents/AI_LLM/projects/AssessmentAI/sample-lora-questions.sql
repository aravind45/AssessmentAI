-- Sample LoRA Questions
-- Replace 'your-lora-assessment-id' with your actual LoRA assessment ID

INSERT INTO custom_questions (
  assessment_type_id,
  question_text,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_answer,
  explanation,
  created_at
) VALUES 
(
  '654c6f5d-5850-4f85-8f1a-55b55012495', -- Replace with your LoRA assessment ID
  'What does LoRA stand for in the context of fine-tuning large language models?',
  'Low-Rank Adaptation',
  'Linear Regression Analysis',
  'Long Range Attention',
  'Latent Representation Architecture',
  'A',
  'LoRA stands for Low-Rank Adaptation, a technique for efficiently fine-tuning large language models.',
  NOW()
),
(
  '654c6f5d-5850-4f85-8f1a-55b55012495', -- Replace with your LoRA assessment ID
  'What is the main advantage of using LoRA for fine-tuning?',
  'Faster training speed',
  'Reduced memory requirements',
  'Better model accuracy',
  'Simpler implementation',
  'B',
  'LoRA significantly reduces memory requirements by using low-rank matrices instead of updating all parameters.',
  NOW()
),
(
  '654c6f5d-5850-4f85-8f1a-55b55012495', -- Replace with your LoRA assessment ID
  'In LoRA, what does the rank parameter control?',
  'Training speed',
  'Model size',
  'Adaptation capacity',
  'Learning rate',
  'C',
  'The rank parameter controls the adaptation capacity - higher rank allows more complex adaptations but uses more memory.',
  NOW()
);

-- Sample RAG Questions  
-- Replace 'your-rag-assessment-id' with your actual RAG assessment ID

INSERT INTO custom_questions (
  assessment_type_id,
  question_text,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_answer,
  explanation,
  created_at
) VALUES 
(
  'your-rag-assessment-id', -- Replace with your RAG assessment ID
  'What does RAG stand for in AI/ML context?',
  'Retrieval Augmented Generation',
  'Random Access Generator',
  'Recursive Algorithm Generation',
  'Reinforced Attention Gateway',
  'A',
  'RAG stands for Retrieval Augmented Generation, combining retrieval systems with generative models.',
  NOW()
),
(
  'your-rag-assessment-id', -- Replace with your RAG assessment ID
  'What is the main benefit of using RAG architecture?',
  'Faster inference',
  'Access to external knowledge',
  'Smaller model size',
  'Better training stability',
  'B',
  'RAG allows models to access external knowledge bases, providing up-to-date and factual information.',
  NOW()
),
(
  'your-rag-assessment-id', -- Replace with your RAG assessment ID
  'Which component is responsible for finding relevant documents in RAG?',
  'Generator',
  'Encoder',
  'Retriever',
  'Decoder',
  'C',
  'The Retriever component searches and finds relevant documents from the knowledge base.',
  NOW()
);