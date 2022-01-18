// Define element objects
const btnBankGetLoan = document.getElementById("btn-bankgetloan")
const btnWorkBank = document.getElementById("btn-paybank")
const btnWorkSalary = document.getElementById("btn-paywork")
const btnBuyNow = document.getElementById("btn-buynow")
const btnRepayLoan = document.getElementById("btn-repayloan")

const dropdownSelectLaptop = document.getElementById("dropdownSelectionLaptops")

const lblBalance = document.getElementById("lbl-balance")
const lblLoan = document.getElementById("lbl-loan")
const lblSalary = document.getElementById("lbl-salary")

const lblLaptopModel = document.getElementById("caption-laptopmodel")
const lblLaptopPrice = document.getElementById("caption-price")

const paragraphDescription = document.getElementById("paragraph-description")
const paragraphSpecs = document.getElementById("paragraph-specs")
const listSpecifications = document.getElementById("list-specifications")

const showOutstandingLoan = document.getElementById("oustanding-loan")
const showRepayLoan = document.getElementById("repay-loan")

// Object to store the information of selected computer
function Laptop() {
    this.id = -1;
    this.title = "";
    this.description = "";
    this.specs = [];
    this.price = "";
    this.stock = "";
    this.active = "";
    this.image = "";
};

// Main class to store customer/user information
function Customer() {
    this.selectedLaptopId = -1;
    this.bankLoanBalance = 0;
    this.customerSalary = 0;
    this.customerBalance = 0;
}


let currentCustomer = new Customer();
let currentSelectedLaptop = new Laptop();

let laptopsArray = [];

// Start with showing default values assigned
lblBalance.innerText = currentCustomer.customerBalance
lblSalary.innerText = currentCustomer.customerSalary
lblLoan.innerText = currentCustomer.bankLoanBalance

showOutstandingLoan.style.display = 'none'
showRepayLoan.style.display = 'none'

// Fetch data of laptops via REST API
fetch("https://noroff-komputer-store-api.herokuapp.com/computers")
.then(function(response) {
    return response.json();
})
.then(function(objLaptops){

    // Add empty Laptop object first in array
    laptopsArray.push(new Laptop());

    // Fill array with fetched objects
    for (item of objLaptops){
        laptopsArray.push(item);
    }

    // Call to fill select box     
    addLaptopsToMenu(laptopsArray);    
})
.catch(function(error) {
    console.log(error)
})


// Create each element for select box
const addLaptopsToMenu = (laptopsArray) => {
    const laptopElement = document.createElement("option");

    laptopsArray.forEach(x => {
        addLaptopToMenu(x);
    });
}

// Fill dropdown list with elements created above
const addLaptopToMenu = (laptop) => {
    const laptopElement = document.createElement("option");

    laptopElement.value = laptop.id;
    laptopElement.appendChild(document.createTextNode(laptop.title));

    dropdownSelectLaptop.appendChild(laptopElement);
}

// Call function after selection changed
const handleLaptopSelectionChange = e => {
    while(listSpecifications.firstChild) {
        listSpecifications.removeChild(listSpecifications.lastChild);
    }

    const selectedLaptop = laptopsArray[e.target.selectedIndex];

    // Store selected laptop into object
    currentCustomer.selectedLaptopId = selectedLaptop.id;

    paragraphDescription.innerText = selectedLaptop.description;
    lblLaptopModel.innerText = selectedLaptop.title;
    lblLaptopPrice.innerText = selectedLaptop.price;

    selectedLaptop.specs.forEach(x => {
        let currentSpecElement = document.createElement('li');

        currentSpecElement.innerText = x;
        listSpecifications.appendChild(currentSpecElement); 
    });
}


// Button click to enter a bank loan
function handleEnterBankLoan() {
    if (currentCustomer.bankLoanBalance > 0)
    {
        alert(`You have already received a loan.\nPlease pay back the old one in full.`);
        return;
    }
    if (currentCustomer.customerBalance == 0)
    {
        alert(`You cannot get a loan. Bank balance is ${currentCustomer.customerBalance}`)
        return
    }

    let numBankLoan = Number(window.prompt("Please enter the requested loan", "0"))

    if (numBankLoan >= (currentCustomer.customerBalance * 2) )
    {
        alert('Your requested loan is greater than you bank balance!')
    }
    else
    {
        // Store loan into object
        currentCustomer.bankLoanBalance = numBankLoan

        lblLoan.innerText = currentCustomer.bankLoanBalance

        showOutstandingLoan.style.display = ''
        showRepayLoan.style.display = ''
    }
} 

// Button click to enter a bank balance
function handleWorkBankBalance() {
    if (currentCustomer.customerSalary == 0) return;

    let repayableAmount = (currentCustomer.customerSalary * 10) / 100
    let transferBalance = currentCustomer.customerSalary - repayableAmount

    if (currentCustomer.bankLoanBalance > 0)
    {
        if (currentCustomer.bankLoanBalance >= repayableAmount)
        {
            currentCustomer.bankLoanBalance -= repayableAmount
        }
        else
        {
            repayableAmount -= currentCustomer.bankLoanBalance
            transferBalance += repayableAmount
            currentCustomer.bankLoanBalance = 0
        }

        currentCustomer.customerBalance += transferBalance
        currentCustomer.customerSalary = 0

        lblSalary.innerText = currentCustomer.customerSalary
        lblBalance.innerText = currentCustomer.customerBalance
        lblLoan.innerText = currentCustomer.bankLoanBalance
    }
    else
    {
        currentCustomer.customerBalance += currentCustomer.customerSalary
        currentCustomer.customerSalary = 0

        lblSalary.innerText = currentCustomer.customerSalary
        lblBalance.innerText = currentCustomer.customerBalance
    }
} 

// Button click to enter a work salary
function handleWorkBankSalary() {
    currentCustomer.customerSalary += 100

    lblSalary.innerText = currentCustomer.customerSalary
} 

// Handle repay loan button 
function handleRepayLoan() {
    if (currentCustomer.customerSalary == 0) return;

    if (currentCustomer.customerSalary > 0 && currentCustomer.bankLoanBalance > 0)
    {
        if (currentCustomer.bankLoanBalance >= currentCustomer.customerSalary)
        {
            currentCustomer.bankLoanBalance -= currentCustomer.customerSalary

            lblLoan.innerText = currentCustomer.bankLoanBalance
        }
        else if (currentCustomer.bankLoanBalance < currentCustomer.customerSalary)
        {
            let remainingFund = currentCustomer.customerSalary - currentCustomer.bankLoanBalance

            currentCustomer.customerBalance += remainingFund;
            currentCustomer.bankLoanBalance = 0   

            lblBalance.innerText = currentCustomer.customerBalance
            lblLoan.innerText = currentCustomer.bankLoanBalance
        }

        currentCustomer.customerSalary = 0    
        lblSalary.innerText = currentCustomer.customerSalary
    }

} 

// Buy and validate for purchase
function handleBuyNow() {
    if (currentCustomer.selectedLaptopId == -1)
    {
        alert("No laptop selected!")    
        return;
    }

    let currentLaptop = laptopsArray.filter(item => item.id == currentCustomer.selectedLaptopId)
    if (currentLaptop.length == 1)
    {
        currentSelectedLaptop = currentLaptop[0];
        console.log(currentSelectedLaptop);

        if (currentCustomer.customerBalance == 0 || currentCustomer.customerBalance < currentSelectedLaptop.price)
        {
            alert(`You cannot afford this laptop.\n\nLaptop price of ${currentSelectedLaptop.price} is higher than your bank balance of ${currentCustomer.customerBalance}`)
        }
        else
        {
            currentCustomer.customerBalance -= currentSelectedLaptop.price;
            lblBalance.innerText = currentCustomer.customerBalance
            
            alert(`Congratulation! You are now the owner of this laptop ${currentSelectedLaptop.title}`)
        }
    }
} 

// Event Listener
dropdownSelectLaptop.addEventListener("change", handleLaptopSelectionChange);
btnBankGetLoan.addEventListener("click", handleEnterBankLoan)
btnWorkBank.addEventListener("click", handleWorkBankBalance)
btnWorkSalary.addEventListener("click", handleWorkBankSalary)
btnBuyNow.addEventListener("click", handleBuyNow)
btnRepayLoan.addEventListener("click", handleRepayLoan)
