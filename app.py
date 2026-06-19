
import datetime

from fastapi import FastAPI, HTTPException, status,Depends
from pydantic import BaseModel
import mysql.connector
import hashlib
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta

mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Mahibahi@z1",
    database="mydatabase"
)

cursor = mydb.cursor(dictionary=True);

SECRET_KEY = "your_super_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

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


class LeaveRequest(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    from_date: datetime.date
    to_date: datetime.date
    total_days: int
    reason: str
    status: str
    manager_comments: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

class LeaveRequestResponse(BaseModel):
    employee_id: int
    leave_type: str
    from_date: datetime.date
    to_date: datetime.date
    reason: str

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
    select_query = "select * from employee;"
    cursor.execute(select_query)
    results=cursor.fetchall()
    return results

@app.get("/employees/{id}",status_code=status.HTTP_200_OK)
def get_user_by_id(id:int):
    select_query = "select * from employee where id=%s;"
    cursor.execute(select_query,(id,))
    results=cursor.fetchone()
    return results


@app.get("/employees/{id}/leave_balance",status_code=status.HTTP_200_OK)
def get_leave_balance(id:int):
    select_query = "select * from employee where id=%s;"
    cursor.execute(select_query,(id,))
    results=cursor.fetchone()
    response={"employee_id":results["id"],"name":results["name"],"leave_balance":results["leave_balance"]}
    return response
    
    
@app.post("/leave_requests",status_code=status.HTTP_201_CREATED)
def insert_leave_request(leave:LeaveRequestResponse):

    insert_query = """
        insert into leave_requests(employee_id,leave_type,from_date,to_date,total_days,reason) values(%s,%s,%s,%s,%s,%s);
    """
    delta = leave.to_date - leave.from_date

    values=(leave.employee_id,leave.leave_type,leave.from_date,leave.to_date,delta.days+1,leave.reason)

    try:
        cursor.execute(insert_query,values)
        mydb.commit()
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=f"Error: {err}")
    
    return {"message": "User inserted successfully"}

@app.get("/leave-requests")
def get_leave_requests():
    select_query = "select * from leave_requests;"
    cursor.execute(select_query)
    results = cursor.fetchall()
    return results

@app.put("/leave-requests/{id}/accept",status_code=status.HTTP_200_OK)
def accept_requests(id:int):

    select_query = "select * from leave_requests where id=%s;"
    cursor.execute(select_query,(id,))
    request_data=cursor.fetchone()

    if request_data is None:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if(request_data["status"]!="Pending"):
        raise HTTPException(status_code=404, detail="Only Pending Leave Request can be Approved")
    
    join_query = "select leave_balance from employee where id=%s ;"
    cursor.execute(join_query,(request_data["employee_id"],))
    balance=cursor.fetchone()
    balance=balance["leave_balance"]

    if(balance < int(request_data["total_days"])):
        raise HTTPException(status_code=404, detail="Not Enough Leave Balance")

    try:
        accept_query="update leave_requests set status='ACCEPTED',manager_comments=%s where id=%s;"
        cursor.execute(accept_query,("Approved",id))
        reduce_query="update employee set leave_balance=leave_balance - %s where id=%s;"
        cursor.execute(reduce_query,(request_data["total_days"],request_data["employee_id"]))
        mydb.commit()
        return {"manager_comments":"Accepted"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=f"Error: {err}")
    
@app.put("/leave-requests/{id}/reject",status_code=status.HTTP_200_OK)
def reject_requests(id:int):

    select_query = "select * from leave_requests where id=%s;"
    cursor.execute(select_query,(id,))
    request_data=cursor.fetchone()

    if request_data is None:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if(request_data["status"]!="Pending"):
        raise HTTPException(status_code=404, detail="Only Pending Leave Request can be Rejcted")
    

    try:
        accept_query="update leave_requests set status='Rejected',manager_comments=%s where id=%s;"
        cursor.execute(accept_query,("Rejected",id))
        mydb.commit()
        return {"manager_comments":"Reejcted"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=f"Error: {err}")
    





















