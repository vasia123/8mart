import os
import re

def create_files_from_input():
    # Проверяем существование файла input.txt
    if not os.path.exists('input.txt'):
        raise FileNotFoundError("Файл input.txt не найден")
    
    # Читаем весь файл как один текст
    with open('input.txt', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Разбиваем контент на строки для построчной обработки
    lines = content.splitlines()
    
    current_file = None
    current_content = []
    code_block_level = 0  # Счетчик уровня вложенности блоков кода
    
    for line in lines:
        # Проверяем, не новый ли это файл
        if line.startswith('// '):
            # Если у нас был предыдущий файл, сохраняем его
            if current_file and current_content:
                save_file(current_file, current_content)
                current_content = []
            
            current_file = line[3:].strip()
            code_block_level = 0  # Сбрасываем уровень вложенности для нового файла
            continue
        
        # Проверяем начало/конец блока кода
        if line.startswith('```'):
            if code_block_level == 0:  # Если это первый блок, начинаем собирать контент
                code_block_level += 1
            else:  # Иначе это либо вложенный блок, либо закрытие блока
                if current_file:  # Добавляем маркер только если мы собираем файл
                    current_content.append(line + '\n')
            continue
        
        # Если мы внутри хотя бы одного блока кода и у нас есть текущий файл, добавляем строку
        if code_block_level > 0 and current_file:
            current_content.append(line + '\n')
    
    # Сохраняем последний файл, если он есть
    if current_file and current_content:
        save_file(current_file, current_content)

def is_valid_filepath(filepath):
    """Проверяет валидность пути к файлу"""
    # Проверяем наличие недопустимых символов
    invalid_chars = '<>:"|?*'
    if any(char in filepath for char in invalid_chars):
        return False
    
    # Проверяем, что путь содержит допустимое расширение файла
    valid_extensions = {'.go', '.py', '.js', '.ts', '.json', '.md', '.txt', '.yml', '.yaml', '.sql'}
    _, ext = os.path.splitext(filepath)
    if ext.lower() not in valid_extensions:
        return False
    
    return True

def save_file(filepath, content):
    if not filepath:
        raise ValueError("Путь к файлу не может быть пустым")
    
    if not is_valid_filepath(filepath):
        raise ValueError(f"Некорректный путь к файлу: {filepath}")
        
    # Получаем директорию файла
    directory = os.path.dirname(filepath)
    
    # Создаем директории только если путь не пустой
    if directory:
        os.makedirs(directory, exist_ok=True)
    
    # Удаляем пустые строки в начале и конце файла
    while content and content[0].strip() == '':
        content.pop(0)
    while content and content[-1].strip() == '':
        content.pop()
    if  content and content[-1].strip() == '```':
        content.pop()
    
    # Записываем содержимое в файл
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(content)
    
    print(f"Создан файл: {filepath}")

if __name__ == "__main__":
    try:
        create_files_from_input()
        print("Создание файлов успешно завершено!")
    except FileNotFoundError as e:
        print(f"Ошибка: {e}")
    except Exception as e:
        print(f"Произошла ошибка: {e}")