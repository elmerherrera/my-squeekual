const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@1995Eclipse',
    database: 'employees_db'
  });
  
  connection.connect(err => {
      if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
      }
      console.log('Connected to database as id ' + connection.threadId);
    });

function mainMenu() {
  inquirer.prompt([
    {type: 'list', name: 'action', message: 'What would you like to do?', choices: ['Add an employee', 'View all employees', 'Update an employee', 'Delete an employee', 'View by department', 'View management', 'View by role', 'end program']}
  ]).then(answer => {
    switch (answer.action) {
      case 'Add an employee':
        addEmployee();
          break;
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'Update an employee':
          updateEmployee();
          break;
        case 'Delete an employee':
          deleteEmployee();
          break;
        case 'View by department':
          viewByDepartment();
          break;
        case 'View management':
          viewManagement();
          break;
        case 'View by role':
          viewByRole();
          break;
        case 'end program':
            endProgram();
        break;
        default:
          console.error('Invalid action: ' + answer.action);
          mainMenu();
      }
  });
}

function addEmployee() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: 'Enter the employee\'s first name:'
    },
    {
      type: 'input',
      name: 'lastName',
      message: 'Enter the employee\'s last name:'
    },
    {
      type: 'input',
      name: 'title',
      message: 'Enter the employee\'s job title:'
    },
    {
      type: 'input',
      name: 'department',
      message: 'Enter the employee\'s department:',
    },
    {
      type: 'number',
      name: 'salary',
      message: 'Enter the employee\'s salary:'
    },
    {
      type: 'confirm',
      name: 'isManager',
      message: 'Is this employee a manager?'
    }
]).then(answers => {
    if (!answers.isManager) {
      // Look up the first manager in the employee's department
      const query = SELECT * `FROM employees WHERE department = ? AND isManager = true LIMIT 1`;
      connection.query(query, [answers.department], (err, results) => {
        if (err) throw err;
        const manager = results[0];
        // Add the new employee to the database with the manager's ID
        const query = `INSERT INTO employees (firstName, lastName, title, department, salary, isManager, manager) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        connection.query(query, [answers.firstName, answers.lastName, answers.title, answers.department, answers.salary, false, `${manager.firstName} ${manager.lastName}`], (err, results) => {
          if (err) throw err;
          console.log(`${answers.firstName} ${answers.lastName} has been added to the database.`);
          mainMenu();
        });
      });
    } 
    else if (!answers.isManager) {
      // Look up the first manager in the employee's department
      const query = SELECT * `FROM employees WHERE department = Management LIMIT 1`;
      connection.query(query, (err, results) => {
        if (err) throw err;
        const manager = results[0];
        // Add the new employee to the database with the manager's ID
        const query = `INSERT INTO employees (firstName, lastName, title, department, salary, isManager, manager) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        connection.query(query, [answers.firstName, answers.lastName, answers.title, answers.department, answers.salary, false, `${manager.firstName} ${manager.lastName}`], (err, results) => {
          if (err) throw err;
          console.log(`${answers.firstName} ${answers.lastName} has been added to the database.`);
          mainMenu();
        });
      });
    }
  });
}

function viewAllEmployees() {
  const query = 'SELECT * FROM employees';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
    } else {
      console.table(results);
    }
    mainMenu();
  });
}

function updateEmployee() {
  // Ask user which employee they want to update
  inquirer.prompt([
    {
      type: 'number',
      name: 'employeeId',
      message: 'What is the id of the employee you would like to update',
    },
  ]).then((employeeAnswer) => {
    // Fetch selected employee's details from the database
    const query = 'SELECT * FROM employees WHERE id = ?';
    connection.query(query, [employeeAnswer.employeeId], (err, results) => {
      if (err) throw err;

      // Ask user which detail they want to change
      inquirer.prompt([
        {
          type: 'list',
          name: 'column',
          message: 'Which detail would you like to change?',
          choices: Object.keys(results[0]).filter((col) => col !== 'id'),
        },
      ]).then((columnAnswer) => {
        // Ask user for new value of the selected detail
        inquirer.prompt([
          {
            type: 'input',
            name: 'value',
            message: `Enter new value for ${columnAnswer.column}:`,
            default: results[0][columnAnswer.column],
          },
        ]).then((valueAnswer) => {
          // Update employee record in the database
          const updateQuery = `UPDATE employees SET ${columnAnswer.column} = ? WHERE id = ?`;
          connection.query(updateQuery, [valueAnswer.value, employeeAnswer.employeeId], (err, updateResults) => {
            if (err) throw err;
            console.log(`${updateResults.affectedRows} record(s) updated`);
            mainMenu();
          });
        });
      });
    });
  });
}

function deleteEmployee() {
  //inquirer prompt to ask which employee do you want to delete with an are you sure prompt after asking which employee to delete
  inquirer.prompt([
      {
        type: 'number',
        name: 'employee',
        message: 'What is the id of the employee you would like to delete',
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to delete this employee?',
        default: false
      }
    ]).then(answers => {
      // Check if the user confirmed the delete
      if (answers.confirm) {
        // Delete the employee
        const query = 'DELETE FROM employees WHERE id = ?';
        connection.query(query, [answers.employee], (err, results) => {
          if (err) {
            console.error('Error deleting employee:', err);
          } else {
            console.log('Employee deleted successfully');
          }
          mainMenu();
        });
      } else {
        // User did not confirm the delete, go back to main menu
        mainMenu();
      }
    });
  };

function viewByDepartment() {
  //asks which department they would like to view and then mysql code to view all employees in said department
  inquirer.prompt([
      {
        type: "input",
        name: "department",
        message: "Enter the department to view:",
      },
    ]).then((answers) => {
      const query = "SELECT * FROM employees WHERE department = ?";
      connection.query(query, [answers.department], (err, results) => {
        if (err) {
          console.error("Error fetching employees by department:", err);
        } else {
          console.table(results);
        }
        mainMenu();
      });
    });
}
function viewManagement() {
  //views all employees where the isManager boolean = true
  const query = 'SELECT * FROM employees WHERE isManager = true';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Management Team:', err);
    } else {
      console.table(results);
    }
    mainMenu();
  });
}
function viewByRole() {
  inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Enter the job title to view:",
    },
  ]).then((answers) => {
    const query = "SELECT * FROM employees WHERE title = ?";
    connection.query(query, [answers.title], (err, results) => {
      if (err) {
        console.error("Error fetching employees by role:", err);
      } else {
        console.table(results);
      }
      mainMenu();
    });
  });
}

function endProgram() {
  process.exit()
}

mainMenu()
