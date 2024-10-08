const firstCalculator = document.querySelector('.calculator');
activateCalculator(firstCalculator);
document.getElementById('add-calculator').addEventListener('click', addNewCalculator);

function addNewCalculator() {
    const calculatorHTML = document.querySelector('.calculator').innerHTML;
    const newCalculatorDiv = document.createElement('div');
    newCalculatorDiv.classList.add('calculator');
    newCalculatorDiv.innerHTML = calculatorHTML;
    document.querySelector('#calculator-container').appendChild(newCalculatorDiv);
    activateCalculator(newCalculatorDiv);
}

function activateCalculator(calculatorDiv) {
    const display = calculatorDiv.querySelector('#calculator__display');
    const calculatorButtons = calculatorDiv.querySelector('.calculator__buttons');
    const historyDiv = calculatorDiv.querySelector('.calculator__history');
    const closeHistory = calculatorDiv.querySelector('.close-icon');
    closeHistory.addEventListener('click',showHistory);
    const olElement = historyDiv.querySelector('ol');
    if (olElement) {
        olElement.remove();
    }
    let newCalculate = false;
    let previousAnswer = false;
    let invalid = 0;
    let openingParanthesis = 0;
    let closingParanthesis = 0;
    const history=[];
    let answer= 0;
    let lastChar = '';
    const normalLabels = ['sin', 'cos', 'tan', 'log','ln'];
    const shiftedLabels = ['v', 'x', 'y', 'z','Rcl'];
    let isShifted = false;
    let variables = {};
    let recall = 0;

    calculatorButtons.addEventListener('click', function(event) {
        const { target } = event;
        if (target.classList.contains('button') && target.id !== 'shift-btn') {
            appendToDisplay(target.innerText);
        } else if (target.id === 'clear') {
            clearDisplay();
        } else if (target.id === 'calculate' && !newCalculate) {
            calculate();
        } else if (target.id === 'delete') {
            newCalculate ? clearDisplay() : removeLastEnteredValue();
        } else if(target.id === 'history') {
            showHistory();
        }
        else if(target.id === 'shift-btn') {
            toggleShift();
        }

    });

    calculatorDiv.addEventListener('keydown', handleKeyboardInput);
    function handleKeyboardInput(event) {
        const key = event.key;
        if (key === 'Enter' && !newCalculate) {
            calculate();
        } else if (key === 'Backspace') {
            newCalculate ? clearDisplay() : removeLastEnteredValue();
        } else if ('0123456789+-*/()'.includes(key)) {
            appendToDisplay(key);
        }
    }

    function toggleShift() {
       const buttons = calculatorDiv.querySelectorAll('#btn1, #btn2, #btn3, #btn4,#btn5');
       buttons.forEach((button, index) => {
        button.textContent = isShifted ? normalLabels[index] : shiftedLabels[index];
    });
        isShifted = !isShifted;
        recall = 0;
    }
    
    function clearDisplay() {
        display.value = '';
        openingParanthesis = 0;
        closingParanthesis = 0;
        invalid = 0;
        newCalculate = false;
        lastChar = '';
    }

    function appendToDisplay(value) {
        if (newCalculate) {
            display.value = answer;
            newCalculate = false;
            lastChar = display.value.slice(-1);
           previousAnswer = true;
        }
        else {
            previousAnswer = false;
        }

        const operators = '+-*/^';
       
        if (((openingParanthesis <= closingParanthesis || lastChar === '(') && value === ')') || 
        (lastChar === 'E' && isNaN(value)) || value === 'E' && isNaN(lastChar) || lastChar === '(' && '+*/^'.includes(value))  {
            return;
        }
        if (value === '(') {
            openingParanthesis += 1;
        } else if (value === ')') {
            closingParanthesis += 1;
        }

        if (operators.includes(value)) invalid = 1;
        else invalid = 0;

        if((lastChar === 'π' || lastChar === 'e' || lastChar === '!' || lastChar === '%' || lastChar === 's')&& 
        (/\d/.test(value) || value === 'π' || value === 'e' || value === 'Ans')) {
            display.value += '*';
        }
        if (operators.includes(lastChar) && operators.includes(value)) {            
            if (value === '-' && '*/^'.includes(lastChar)) 
                display.value += value;
            else 
                display.value = display.value.slice(0, -1) + value;
        }
        else if (shiftedLabels.includes(value) && value !== 'Rcl') {
            if (recall) {
             variables.value ? display.value += variables.value : alert(`No value stored in ${value}`);
                
            } else {
                variables.value = display.value;
                alert(`${display.value} stored in variable ${value}`);
            }
            toggleShift();  
        }
        
         else if(value === 'Rcl')
            recall = 1;
        else {
            if(/\d/.test(value) && previousAnswer) {
             display.value = '';
             previousAnswer = false ;

            }
           
            display.value += value;
        }
         if(['sin', 'cos', 'tan','√','log','ln'].includes(value)){
            display.value += '(';
            openingParanthesis += 1;
         }

        lastChar = display.value.slice(-1);
       
    }

    function removeLastEnteredValue() {
        lastChar = display.value.slice(-1);
        display.value = display.value.slice(0, -1);
        if (lastChar === '(') openingParanthesis--;
        else if (lastChar === ')') closingParanthesis--;
    }

    function infixToPostfix(input) {
        const expression = input.match(/\d+|\-|\(|\)|\+|\*|\/|\^|√|\!|\%|Ans|E|e|π|ln|log|sin|cos|tan/g);  
        const precedence = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
            '^': 3,
            '$': 4,
            'sin': 4,
            'cos': 4,
            'tan': 4,
            '√': 4,
            'log': 4,
            'ln': 4,
            '!': 4,
            'E': 4,
            '%': 4
        };
        const output = [];
        const operators = [];
        let previousChar = '(';
        for (let char of expression) {
            if (/\d/.test(char)) {
                output.push(char);
            } else if(char === 'π'){
                output.push(Math.PI);
                if(/\d/.test(previousChar))
                    operators.push('*');
            } else if(char === 'e'){
                output.push(Math.E);
                if(/\d/.test(previousChar))
                    operators.push('*');
            } else if(char === 'Ans'){
                output.push(answer);
                if(/\d/.test(previousChar))
                    operators.push('*');
            }
            else if (char in precedence) {
                if (char === '-' && (previousChar === '(' || '*/^'.includes(previousChar))) {
                    operators.push('$');
                } else {
                while (operators.length && precedence[operators[operators.length - 1]] >= precedence[char]) {
                    output.push(operators.pop());
                }
                if(['sin', 'cos', 'tan','√','log','ln'].includes(char) && /\d/.test(previousChar))
                    operators.push('*');
                operators.push(char);
            }
            previousChar = char;
            } else if (char === '(') {
                if (/\d/.test(previousChar) || previousChar === ')' || previousChar === '!' || previousChar === '%') 
                    operators.push('*');
                operators.push(char);
            } else if (char === ')') {
                let op = operators.pop();
                while (op !== '(') {
                    output.push(op);
                    op = operators.pop();
                }
            }
            previousChar=char;
        } 
        while (operators.length) {
            output.push(operators.pop());
        }
        return output;
    }
    function evaluatePostfix(postfix) {
        const result = [];
        for (let char of postfix) {
            if (/\d/.test(char)) {
                result.push(Number(char));
            } else if (char === '$') {
                let number = result.pop();
                result.push(-number);
            } else if (['+', '-', '*', '/', '^','E'].includes(char)) {
                if (result.length < 2) throw new Error("Invalid input");
                let operand2 = result.pop();
                let operand1 = result.pop();
                switch (char) {
                    case '+':
                        result.push(operand1 + operand2);
                        break;
                    case '-':
                        result.push(operand1 - operand2);
                        break;
                    case '*':
                        result.push(operand1 * operand2);
                        break;
                    case '/':
                        if (operand2 === 0) throw new Error("Can't divide by zero");
                        result.push(operand1 / operand2);
                        break;
                    case '^':
                        result.push(Math.pow(operand1, operand2));
                        break;
                    case 'E':
                        result.push(operand1 * Math.pow(10,operand2));
                        break;
                }
            } else if (['sin', 'cos', 'tan','√','log','ln','!','%'].includes(char)) {
                if (!result.length) throw new Error("Invalid input");
                let operand = result.pop();
                switch (char) {
                    case 'sin':
                        result.push(Math.sin(operand));
                        break;
                    case 'cos':
                        result.push(Math.cos(operand));
                        break;
                    case 'tan':
                        result.push(Math.tan(operand));
                        break;
                    case '√':
                        if(operand < 0) throw new Error("Square root of negative number is not real");
                        result.push(Math.sqrt(operand));
                        break;
                    case 'log':
                        result.push(Math.log10(operand));
                        break;
                    case 'ln':
                        result.push(Math.log(operand));
                        break;
                    case '!':
                        result.push(factorial(operand));
                        break;
                    case '%':
                        result.push(operand/100);
                        break;

                }
            } else{
                    throw new Error("Error");
                }
        }
        return result[0];
    }

    function calculate() {
        try {
            if (invalid) throw new Error("Incomplete Expression");
            while (openingParanthesis > closingParanthesis && display.value.slice(-1) !== '(') {
                appendToDisplay(')');
            }
            const input = display.value;
            const postfix = infixToPostfix(input);
            const result = evaluatePostfix(postfix);
            answer = result;
            const calculation = `${input} = ${result}`;
            display.value += '=' + '\n' + result;
            history.push(calculation);
            if (history.length > 10) {
                history.shift();  
                const ol = historyDiv.querySelector('ol');
                if (ol && ol.firstChild) {
                    ol.removeChild(ol.firstChild);  
                }
            }
            appendNewHistoryItem(input,result);
            newCalculate = true;
            lastChar = '';
            variables ={};

        } catch (error) {
            alert(error.message);
            newCalculate = true;
            clearDisplay();
        }
    }
    function appendNewHistoryItem(input,result) {
        let ol = historyDiv.querySelector('ol');
        if (!ol) {
            ol = document.createElement('ol');
            historyDiv.appendChild(ol);
        }
        const historyItem = document.createElement('li');
        historyItem.innerHTML = `<span id="input">${input}</span><span> = </span><span id = "result">${result}</span>`;
        ol.appendChild(historyItem);  
        historyItem.addEventListener('click', function(event) {
            const { target } = event;
            if(target.id === 'input' || target.id === 'result') {
            display.value = target.innerHTML;
            lastChar = display.value.slice(-1);
           newCalculate = false;
            showHistory(); 
            }
        });
        
    }
    
    function showHistory() {
        historyDiv.classList.toggle('display__history');
    }
    
    function factorial(number) {
        let fact = 1;
        for (let i = 2; i <= number; i++) {
            fact *= i;
        }
        return fact;
    }


}





