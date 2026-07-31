
class AppBaseException(Exception):
    def __init__(self, detail: str, status_code: int):
        self.detail = detail
        self.status_code = status_code

class NotFoundException(AppBaseException):
    def __init__(self, detail: str = "Not found"):
        super().__init__(detail, status_code=404)

class BadRequestException(AppBaseException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(detail, status_code=400)


class InvalidCredentialsException(AppBaseException):
    def __init__(self, detail: str = "Invalid credentials"):
        super().__init__(detail, status_code=401)


class TokenLimitExceededException(AppBaseException):
    def __init__(self, detail: str = "Input exceeds maximum token limit allowed for this processing request."):
        super().__init__(detail, status_code=400)  


class InsufficientQuotaException(AppBaseException):
    def __init__(self, detail: str = "Insufficient AI processing tokens or balance remaining."):
        super().__init__(detail, status_code=402)  


class RateLimitExceededException(AppBaseException):
    def __init__(self, detail: str = "Rate limit exceeded. Please try again after a few moments."):
        super().__init__(detail, status_code=429)  