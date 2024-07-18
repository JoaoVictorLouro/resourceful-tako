export ZSH=$HOME/.oh-my-zsh
export LANG=en_US.UTF-8

PS1="%F{blue}%0~%f ~$: "
CASE_SENSITIVE="true"
DISABLE_AUTO_TITLE="true"
COMPLETION_WAITING_DOTS="true"
ENABLE_CORRECTION="false"
DISABLE_AUTO_UPDATE=true
DISABLE_UPDATE_PROMPT=true
ZSH_DOTENV_PROMPT=false

plugins=(
  dircycle dirhistory dotenv git gitignore history node npm sudo wd zsh-navigation-tools
)

if [[ -n $SSH_CONNECTION ]]; then
  export EDITOR='nano'
else
  export EDITOR='code'
fi

alias zshconfig="mate ~/.zshrc"
alias ohmyzsh="mate ~/.oh-my-zsh"
alias ..='cd ..'
alias cd..='cd ..'
alias a="pnpm"

source $ZSH/oh-my-zsh.sh
