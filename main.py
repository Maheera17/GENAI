import datetime

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
import mysql.connector
import hashlib

mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Mahibahi@z1",
    database="mydatabase"
)

cursor = mydb.cursor(dictionary=True);

class DBModel(BaseModel):
    id:int
    email:str
    name:str
    department:str
    role:str
    leave_balance:int
    createdAt:datetime.datetime

class EmployeeRequest(BaseModel):
    email:str
    name:str
    department:str
    role:str
    leave_balance:int

class LeaveBalanceResponse():
    employee_id:int
    name:str
    leave_balance:int



app = FastAPI()

@app.get("/")
def home():
    return {"message": "Hello FastAPI"}


@app.post("/employee",status_code=status.HTTP_201_CREATED)
def insert_employee(employee:EmployeeRequest):

    insert_query = """
        insert into employee(name,email,department,role,leave_balance) values(%s,%s,%s,%s,%s);
    """

    values = (employee.name,employee.email,employee.department,employee.role,employee.leave_balance);

    try:
        cursor.execute(insert_query,values)
        mydb.commit();
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=f"Error: {err}")
    
    return {"message": "User inserted successfully"}


@app.get("/employees",status_code=status.HTTP_200_OK)
def get_all_employees():
    select_query = "select * from employee"
    cursor.execute(select_query)
    results=cursor.fetchall()
    return results

@app.get("/employees/{id}",status_code=status.HTTP_200_OK)
def get_user_by_id(id:int):
    select_query = "select * from employee where id=%s"
    cursor.execute(select_query,(id,))
    results=cursor.fetchone()
    return results


@app.get("/employees/{id}/leave-balance",status_code=status.HTTP_200_OK)
def get_leave_balance(id:int):
    select_query = "select * from employee where id=%s"
    cursor.execute(select_query,(id,))
    results=cursor.fetchone()
    response={"employee_id":results["id"],"name":results["name"],"leave_balance":results["leave_balance"]}
    return response
    
    

    








