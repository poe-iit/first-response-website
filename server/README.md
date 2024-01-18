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