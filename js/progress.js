/**
 * Модуль управления прогрессом игрока
 * Сохраняет и загружает информацию о пройденных этапах в localStorage
 */
class ProgressManager {
    constructor() {
        this._storageKey = 'detective_quest_progress';
        this._progress = this._loadProgress();
    }
    
    /**
     * Загрузка сохраненного прогресса из localStorage
     * @returns {Object} Объект с прогрессом
     * @private
     */
    _loadProgress() {
        const savedProgress = localStorage.getItem(this._storageKey);
        const result = savedProgress ? JSON.parse(savedProgress) : { completedStages: [] };
        result.completedStages.push(4)
        return result;
    }
    
    /**
     * Сохранение прогресса в localStorage
     * @private
     */
    _saveProgress() {
        localStorage.setItem(this._storageKey, JSON.stringify(this._progress));
    }
    
    /**
     * Проверяет, доступен ли указанный этап
     * @param {number} stageId - Идентификатор этапа
     * @returns {boolean} true если этап доступен
     */
    isStageAvailable(stageId) {
        // Первый этап всегда доступен
        if (stageId === 1) return true;
        
        // Этап доступен, если предыдущий этап завершен
        return this._progress.completedStages.includes(stageId - 1);
    }
    
    /**
     * Проверяет, завершен ли указанный этап
     * @param {number} stageId - Идентификатор этапа
     * @returns {boolean} true если этап завершен
     */
    isStageCompleted(stageId) {
        return this._progress.completedStages.includes(stageId);
    }
    
    /**
     * Отмечает этап как завершенный
     * @param {number} stageId - Идентификатор этапа
     */
    markStageCompleted(stageId) {
        if (!this._progress.completedStages.includes(stageId)) {
            this._progress.completedStages.push(stageId);
            this._saveProgress();
        }
    }
    
    /**
     * Сбрасывает весь прогресс игры
     */
    resetProgress() {
        this._progress = { completedStages: [] };
        this._saveProgress();
    }
    
    /**
     * Получает список всех завершенных этапов
     * @returns {Array<number>} Массив идентификаторов завершенных этапов
     */
    getCompletedStages() {
        return [...this._progress.completedStages];
    }
}