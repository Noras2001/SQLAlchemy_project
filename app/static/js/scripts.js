"use strict";

document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();

    // Обработка формы создания книги
    const createForm = document.getElementById('create-book-form');
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const book = {
            book_name: document.getElementById('book_name').value,
            author: document.getElementById('author').value,
            genre: document.getElementById('genre').value,
            date_issue: document.getElementById('date_issue').value,
            price: parseFloat(document.getElementById('price').value),
        };

        try {
            const response = await fetch('/api/books/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(book),
            });

            if (response.ok) {
                const newBook = await response.json();
                alert(`Book created: ${newBook.book_name} by ${newBook.author}`);
                createForm.reset();
                fetchBooks();
            } else {
                const error = await response.json();
                alert(`Error: ${error.detail}`);
            }
        } catch (error) {
            console.error('Error creating book:', error);
        }
    });

    // Обработка формы просмотра книги по ID
    const viewForm = document.getElementById('view-book-form');
    viewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bookId = document.getElementById('view_book_id').value;

        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const resultDiv = document.getElementById('view-book-result');
            if (response.ok) {
                const book = await response.json();
                resultDiv.innerHTML = `
                    <h4>Book Details:</h4>
                    <p><strong>ID:</strong> ${book.id}</p>
                    <p><strong>Name:</strong> ${book.book_name}</p>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>Genre:</strong> ${book.genre}</p>
                    <p><strong>Date of Issue:</strong> ${book.date_issue}</p>
                    <p><strong>Price:</strong> $${book.price.toFixed(2)}</p>
                `;
            } else {
                const error = await response.json();
                resultDiv.innerHTML = `<p class="text-danger">Error: ${error.detail}</p>`;
            }
        } catch (error) {
            console.error('Error fetching book:', error);
        }
    });

    // Обработка формы обновления книги
    const updateForm = document.getElementById('update-book-form');
    updateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bookId = document.getElementById('update_book_id').value;
        const book = {
            book_name: document.getElementById('update_book_name').value,
            author: document.getElementById('update_author').value,
            genre: document.getElementById('update_genre').value,
            date_issue: document.getElementById('update_date_issue').value,
            price: parseFloat(document.getElementById('update_price').value),
        };

        // Удаление пустых полей для частичного обновления
        Object.keys(book).forEach(key => {
            if (!book[key]) {
                delete book[key];
            }
        });

        try {
            // Сначала получаем существующие данные книги
            const existingResponse = await fetch(`/api/books/${bookId}`);
            if (!existingResponse.ok) {
                const error = await existingResponse.json();
                alert(`Error: ${error.detail}`);
                return;
            }
            const existingBook = await existingResponse.json();

            // Объединяем существующие данные с новыми
            const updatedBook = {
                book_name: book.book_name || existingBook.book_name,
                author: book.author || existingBook.author,
                genre: book.genre || existingBook.genre,
                date_issue: book.date_issue || existingBook.date_issue,
                price: book.price || existingBook.price,
            };

            const response = await fetch(`/api/books/${bookId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedBook),
            });

            if (response.ok) {
                const updated = await response.json();
                alert(`Book updated: ${updated.book_name} by ${updated.author}`);
                updateForm.reset();
                fetchBooks();
            } else {
                const error = await response.json();
                alert(`Error: ${error.detail}`);
            }
        } catch (error) {
            console.error('Error updating book:', error);
        }
    });

    // Обработка формы удаления книги
    const deleteForm = document.getElementById('delete-book-form');
    deleteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bookId = document.getElementById('delete_book_id').value;

        if (!confirm(`Are you sure you want to delete book ID ${bookId}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const deletedBook = await response.json();
                alert(`Book deleted: ${deletedBook.book_name} by ${deletedBook.author}`);
                deleteForm.reset();
                fetchBooks();
            } else {
                const error = await response.json();
                alert(`Error: ${error.detail}`);
            }
        } catch (error) {
            console.error('Error deleting book:', error);
        }
    });

    // Функция для загрузки и отображения всех книг
    async function fetchBooks() {
        try {
            const response = await fetch('/api/books/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const books = await response.json();
                populateBooksTable(books);
            } else {
                console.error('Error fetching books');
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    }

    // Функция для заполнения таблицы книг
    function populateBooksTable(books) {
        const tbody = document.querySelector('#books-table tbody');
        tbody.innerHTML = ''; // Очистка существующих строк

        if (books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No books found</td></tr>';
            return;
        }

        books.forEach(book => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${book.id}</td>
                <td>${book.book_name}</td>
                <td>${book.author}</td>
                <td>${book.genre}</td>
                <td>${book.date_issue}</td>
                <td>$${book.price.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    }
});
