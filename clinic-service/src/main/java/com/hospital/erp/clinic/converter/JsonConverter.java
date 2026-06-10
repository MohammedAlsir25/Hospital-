package com.hospital.erp.clinic.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;

/**
 * Standard JPA AttributeConverter mapping Java structures to JSONB strings.
 * Used for storing orders (labs, imaging, prescriptions) and custom clinical documents like dental odontograms.
 */
@Converter(autoApply = true)
public class JsonConverter implements AttributeConverter<Object, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Object attribute) {
        if (attribute == null) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failure serializing attribute to database JSON column structure", e);
        }
    }

    @Override
    public Object convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readTree(dbData);
        } catch (IOException e) {
            throw new IllegalArgumentException("Failure deserializing database JSON column structure to object model", e);
        }
    }
}
