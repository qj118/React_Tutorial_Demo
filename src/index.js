import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props){
    const highlight = props.highlight ? "win-highlight" : "";
    return (
        <button className={`square ${highlight}`}
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
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)} // 通过 Game 获得该值，并将值传递给 Square
                highlight={this.props.highlight[i]}
            />
        );
    }

    render() {
        return (
            <div>
                {
                    Array(3).fill(null).map((item_x, x) => (
                        <div className="board-row" key={x}>
                            {
                                Array(3).fill(null).map((item_y, y) => (
                                    this.renderSquare(3 * x + y)
                                ))
                            }
                        </div>
                    ))
                }
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
                active: false
            }], // history 是每一步后整个棋盘状态组成的数组
            xIsNext: true,
            stepNumber: 0,
            reversed: false,
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
        const active = false;
        // 下新的一步时，将所有 moves 的激活状态置成 false
        for(let i = 0; i < history.length; i ++){
            history[i].active = false;
        }
        this.setState({
             history: history.concat([{
                 squares: squares,
                 column: column, // 每一步的位置
                 row: row,
                 active: active // 当前步是否处于激活状态（即当前按钮是否处于点击状态）
             }]), // 每下一步，对 history 追加一个状态数组
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step){
        const history = this.state.history;
        for(let i = 0; i < history.length;i++){
            const current = history[i];
            if(i === step){
                current.active = true;
            }else{
                current.active = false;
            }
            history[i] = current;
        }
        this.setState({
            history: history,
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
        // this.moveButton.classList.add("font-bold");
    }

    handleReverse = () => {
        this.setState({
            reversed: !this.state.reversed,
        });
        //console.log(this.state.reversed);
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber]; // 当前棋盘状态
        const winnerResult = calculatorWinner(current.squares);
        const highlight = Array(9).fill(false); // 存储当前棋盘上是否有棋子需要高亮，只有在出现胜者时才置成 true
        const draw = calculatorDraw(current.squares);

        const moves = history.map((step,move) => { // map 映射，第一个参数是当前元素，第二个参数为当前元素的索引
           const desc = move ? 'Go to move #' + move + ", location(" + step.column + ", " + step.row + ")" : 'Go to game start';
           const fontClass = step.active ? "font-bold" : "";
           return (
               <li key={move}>
                   <button onClick={() => this.jumpTo(move)} className={`${fontClass}`}>{desc}</button>
               </li>
           );
        });

        let status;
        if(winnerResult)
        {
            const winner = winnerResult.winner;
            const winArr = winnerResult.winArr;
            status = 'Winner: ' + winner;
            for(let i = 0; i < 3; i++){
                highlight[winArr[i]] = true;
            }
        }else if(draw){
            status = "Draw";
        }else{
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)} // 将 props 传递给 Board，Board 再传递给 Square。
                        highlight={highlight}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button onClick={this.handleReverse}>Reverse Moves List</button>
                    {/*<ol>{moves.reverse()}</ol>*/}
                    {/* ol 上加 reverse 只是将序号反过来，这里不仅要将序号反过来，还要将整个 moves 数组反过来 */}
                    {this.state.reversed ? <ol reversed>{moves.reverse()}</ol> :  <ol>{moves}</ol>}
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
            return {
                winner: squares[a],
                winArr: lines[i]
            } // 不仅仅返回胜者，还要返回获胜连线的坐标
        }
    }
    return null;
}

function calculatorDraw(squares){
    for(let i = 0; i < 9; i++){
        if(!squares[i]){
            return false;
        }
    }
    return true;
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
