# app/crud.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from . import models, schemas

# Создание новой книги
async def create_book(db: AsyncSession, book: schemas.BookCreate):
    db_book = models.Book(**book.dict())
    db.add(db_book)
    await db.commit()
    await db.refresh(db_book)
    return db_book

# Получение всех книг с поддержкой фильтрации
async def get_books(db: AsyncSession, skip: int = 0, limit: int = 100, book_name: str = None, author: str = None):
    # Формируем запрос для получения книг
    query = select(models.Book)
    # Если задан фильтр по названию, добавляем условие в запрос
    if book_name:
        query = query.where(models.Book.book_name.ilike(f"%{book_name}%"))
    # Если задан фильтр по автору, добавляем условие в запрос
    if author:
        query = query.where(models.Book.author.ilike(f"%{author}%"))
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

# Получение книги по ID
async def get_book(db: AsyncSession, book_id: int):
    result = await db.execute(select(models.Book).where(models.Book.id == book_id))
    return result.scalars().first()

# Обновление книги
async def update_book(db: AsyncSession, book_id: int, book: schemas.BookCreate):
    db_book = await get_book(db, book_id)
    if db_book:
        db_book.book_name = book.book_name
        db_book.author = book.author
        db_book.genre = book.genre
        db_book.date_issue = book.date_issue
        db_book.price = book.price
        await db.commit()
        await db.refresh(db_book)
    return db_book

# Удаление книги
async def delete_book(db: AsyncSession, book_id: int):
    db_book = await get_book(db, book_id)
    if db_book:
        await db.delete(db_book)
        await db.commit()
    return db_book
