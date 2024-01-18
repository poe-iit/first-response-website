# Setup Steps
- Create a [virtual environment](https://www.arch.jhu.edu/python-virtual-environments/) (optional)
- Install packages
```bash
pip install -r requirements.txt
```
- Start the server
```bash
uvicorn main:app --port 8000 --reload
```

# Before pull request
- Run test script to make sure the update does not break preexisitin code
```bash
# In the server directory
python test.py
```