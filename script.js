document.addEventListener('DOMContentLoaded', function() {
    const calculator = {
        displayValue: '0',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null,
        history: loadHistory()
    };

    function loadHistory() {
        const savedHistory = localStorage.getItem('calculatorHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    }

    function saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(calculator.history));
        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        const historyList = document.querySelector('.history-list');
        historyList.innerHTML = '';
        
        calculator.history.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'history-item';
            listItem.innerHTML = `
                <div>
                    <div class="history-expression">${item.expression}</div>
                    <div class="history-result">${item.result}</div>
                </div>
                <div>
                    <button class="delete-item" data-index="${index}">×</button>
                </div>
            `;
            historyList.appendChild(listItem);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                calculator.history.splice(index, 1);
                saveHistory();
            });
        });
    }

    function updateDisplay() {
        const display = document.querySelector('.calculator-screen');
        display.value = calculator.displayValue;
    }

    function inputDigit(digit) {
        const { displayValue, waitingForSecondOperand } = calculator;
        
        if (waitingForSecondOperand) {
            calculator.displayValue = digit;
            calculator.waitingForSecondOperand = false;
        } else {
            calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
        }
    }

    function inputDecimal(dot) {
        if (calculator.waitingForSecondOperand) {
            calculator.displayValue = '0.';
            calculator.waitingForSecondOperand = false;
            return;
        }

        if (!calculator.displayValue.includes(dot)) {
            calculator.displayValue += dot;
        }
    }

    function handleOperator(nextOperator) {
        const { firstOperand, displayValue, operator } = calculator;
        const inputValue = parseFloat(displayValue);
        
        if (firstOperand === null && !isNaN(inputValue)) {
            calculator.firstOperand = inputValue;
        } else if (operator) {
            const result = performCalculation[operator](firstOperand, inputValue);
            
            calculator.displayValue = `${parseFloat(result.toFixed(7))}`;
            calculator.firstOperand = result;
        }
        
        calculator.waitingForSecondOperand = true;
        calculator.operator = nextOperator;
    }

    const performCalculation = {
        '/': (firstOperand, secondOperand) => firstOperand / secondOperand,
        '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
        '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
        '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
        '=': (firstOperand, secondOperand) => secondOperand,
        '%': (firstOperand, secondOperand) => (firstOperand * secondOperand) / 100
    };

    function resetCalculator() {
        calculator.displayValue = '0';
        calculator.firstOperand = null;
        calculator.waitingForSecondOperand = false;
        calculator.operator = null;
    }

    function clearEntry() {
        calculator.displayValue = '0';
    }

    function handleEqual() {
        if (calculator.firstOperand === null) {
            return;
        }
        
        const inputValue = parseFloat(calculator.displayValue);
        
        if (calculator.operator && !calculator.waitingForSecondOperand) {
            const result = performCalculation[calculator.operator](calculator.firstOperand, inputValue);
            const expression = `${calculator.firstOperand} ${getOperatorSymbol(calculator.operator)} ${inputValue}`;
            
            calculator.displayValue = `${parseFloat(result.toFixed(7))}`;
            
            // Add to history
            calculator.history.unshift({
                expression: expression,
                result: calculator.displayValue
            });
            
            // Limit history to 50 items
            if (calculator.history.length > 50) {
                calculator.history.pop();
            }
            
            saveHistory();
            
            calculator.firstOperand = result;
            calculator.operator = null;
            calculator.waitingForSecondOperand = true;
        }
    }

    function getOperatorSymbol(operator) {
        const symbols = {
            '/': '÷',
            '*': '×',
            '+': '+',
            '-': '-',
            '%': '%'
        };
        return symbols[operator] || operator;
    }

    // Set up event listeners
    document.querySelector('.calculator-buttons').addEventListener('click', (event) => {
        const { target } = event;
        
        if (!target.matches('button')) {
            return;
        }
        
        if (target.classList.contains('operator')) {
            handleOperator(target.value);
            updateDisplay();
            return;
        }
        
        if (target.classList.contains('number')) {
            inputDigit(target.value);
            updateDisplay();
            return;
        }
        
        if (target.classList.contains('equal')) {
            handleEqual();
            updateDisplay();
            return;
        }
        
        if (target.classList.contains('clear')) {
            resetCalculator();
            updateDisplay();
            return;
        }
        
        if (target.classList.contains('clear-entry')) {
            clearEntry();
            updateDisplay();
            return;
        }
        
        if (target.value === '.') {
            inputDecimal(target.value);
            updateDisplay();
            return;
        }
    });

    // Clear history button
    document.querySelector('.clear-history-btn').addEventListener('click', function() {
        calculator.history = [];
        saveHistory();
    });

    // Initialize
    updateDisplay();
    updateHistoryDisplay();
});