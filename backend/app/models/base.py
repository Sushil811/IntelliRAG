from sqlalchemy.orm import DeclarativeBase, declared_attr
import re

class Base(DeclarativeBase):
    @declared_attr.directive
    def __tablename__(cls) -> str:
        # Convert CamelCase to snake_case for table names
        name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', cls.__name__)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower()
