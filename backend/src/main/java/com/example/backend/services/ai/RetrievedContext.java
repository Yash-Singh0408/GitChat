package com.example.backend.services.ai;

import com.example.backend.dto.CitationDto;

import java.util.List;

public record RetrievedContext (
        List<CitationDto> citations,
        String contextText
){

}
