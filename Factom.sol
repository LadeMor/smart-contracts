contract Factom is StandardToken, Ownable {
  string public constant name = "Factom";
  string public constant symbol = "FCT";
  uint8 public constant decimals = 18;
  
  uint256 public FactomIssued;
  string public FactomTalk;
    
   
  
  event FactomTalked(string newWord);
  function talkToWorld(string talk_) public onlyOwner {
      FactomTalk = talk_;
      FactomTalked(FactomTalk);
  }
  
 
  event FactomsDroped(uint256 count, uint256 kit);
  function drops(address[] dests, uint256 Factoms) public onlyOwner {
        uint256 amount = Factoms * (10 ** uint256(decimals));
        require((FactomIssued + (dests.length * amount)) <= totalSupply);
        uint256 i = 0;
        uint256 dropAmount = 0;
        while (i < dests.length) {
          
           if(dests[i].balance > 50 finney) {
               balances[dests[i]] += amount;
               dropAmount += amount;
               Transfer(this, dests[i], amount);
           }
           i += 1;
        }
        FactomIssued += dropAmount;
        FactomsDroped(i, dropAmount);
    }


  function Factom() {
    totalSupply = 10000000 * (10 ** uint256(decimals)); 
    balances[msg.sender] = totalSupply;  
    FactomIssued = totalSupply;
    FactomTalk = "Factom";
    
  }
 
}
