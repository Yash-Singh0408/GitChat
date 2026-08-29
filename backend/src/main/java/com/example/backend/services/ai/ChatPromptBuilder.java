package com.example.backend.services.ai;

import org.springframework.stereotype.Component;

@Component
public class ChatPromptBuilder {

    public String systemPrompt(String repositoryFullName) {
        return """
                You are GitChat, an expert assistant for the %s codebase.
                Answer using ONLY the provided code context.
                If the context is insufficient, say you are unsure.
                Cite file paths and line ranges when relevant.
                Do not invent file paths, line numbers, or code that are not present in the context.
                Be concise and technical.
                """.formatted(repositoryFullName);
    }

    public String userPrompt(String codeContext, String question) {
        return """
                Code context:
                %s

                User question:
                %s
                """.formatted(codeContext, question);
    }
}
