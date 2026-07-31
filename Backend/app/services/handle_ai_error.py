from app.services.exceptions import (
    RateLimitExceededException,
    TokenLimitExceededException,
    InsufficientQuotaException,
    BadRequestException
)



def handle_ai_error(e: Exception):
   
    err_str = str(e).lower()

    
    if "429" in err_str or "rate limit" in err_str or "too many requests" in err_str:
        raise RateLimitExceededException(
            detail="Grok AI rate limit hit. Please wait a few seconds and try again."
        )

    
    if "context_length_exceeded" in err_str or "maximum context length" in err_str or "prompt is too long" in err_str:
        raise TokenLimitExceededException(
            detail="The document or input text exceeds Grok's maximum token limit."
        )

   
    if "insufficient_quota" in err_str or "credit balance" in err_str or "402" in err_str:
        raise InsufficientQuotaException(
            detail="Your xAI / Grok account has insufficient credits or quota."
        )

   
    if "invalid_api_key" in err_str or "incorrect api key" in err_str or "401" in err_str:
        raise BadRequestException(
            detail="Invalid xAI API key provided. Check your configuration."
        )

   
    raise e