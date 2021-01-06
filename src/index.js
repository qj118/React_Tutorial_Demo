import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props){
    return (
        <button className="square"
                onClick={props.onClick} //通过 Board 获得该值
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {

    renderSquare(i) {
        return (
            <Square
                value = {this.props.squares[i]}
                onClick= {() => this.props.onClick(i)} // 通过 Game 获得该值，并将值传递给 Square
            />
        );
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                column: null,
                row: null,
            }], // history 是每一步后整个棋盘状态组成的数组
            xIsNext: true,
            stepNumber: 0,
        };
    }

    handleClick(i)
    {
        const history = this.state.history.slice(0, this.state.stepNumber + 1); // 数组截取，前闭后开区间
        const current = history[history.length - 1]; // 获取当前棋盘状态
        const squares = current.squares.slice();
        if(calculatorWinner(squares) || squares[i]) // 第 i 个位置有值或者已经有人赢得了比赛
        {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        const column = i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 3;
        const row = i < 3 ? 1 : i > 5 ? 3 : 2;
        this.setState({
             history: history.concat([{
                 squares: squares,
                 column: column,
                 row: row
             }]), // 每下一步，对 history 追加一个状态数组
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });

    }

    jumpTo(step){
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber]; // 当前棋盘状态
        const winner = calculatorWinner(current.squares);

        const moves = history.map((step,move) => { // map 映射，第一个参数是当前元素，第二个参数为当前元素的索引
           const desc = move ? 'Go to move #' + move + ", location(" + step.column + ", " + step.row + ")" : 'Go to game start';
           return (
               <li key={move}>
                   <button onClick={() => this.jumpTo(move)}>{desc}</button>
               </li>
           );
        });

        let status;
        if(winner)
        {
            status = 'Winner: ' + winner;
        }else{
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)} // 将 props 传递给 Board，Board 再传递给 Square。
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

function calculatorWinner(squares)
{
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++)
    {
        const [a, b, c] = lines[i];
        if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]){
            return squares[a];
        }
    }
    return null;
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
