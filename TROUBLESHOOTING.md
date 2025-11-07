# Troubleshooting Guide

## "Contact Supplier" Button Not Working

If the "Contact Supplier" button doesn't work, check the following:

### 1. Check Browser Console
- Open browser DevTools (F12)
- Go to Console tab
- Look for any errors when clicking the button
- You should see: `Contacting supplier: [id] [name]`

### 2. Check Network Tab
- Open browser DevTools (F12)
- Go to Network tab
- Click "Contact Supplier" button
- Look for a POST request to `/api/suppliers/{id}/outreach`
- Check if it returns 200 (success) or an error code

### 3. Verify Backend is Running
- Make sure backend is running on `http://localhost:8000`
- Test by visiting: `http://localhost:8000/docs`
- You should see the Swagger API documentation

### 4. Check Supplier Status
- The button only shows when:
  - `supplier.status === 'contacted'`
  - `supplier.availability_scope === true`
- Debug info (in development mode) shows these values below each supplier

### 5. Common Issues

**Issue: Button doesn't appear**
- **Cause**: Supplier status is not 'contacted' or availability_scope is false/null
- **Solution**: After scouting, suppliers with availability_scope=true should have status 'contacted'
- **Check**: Look at debug info to see actual values

**Issue: Button appears but nothing happens when clicked**
- **Cause**: JavaScript error or API call failing
- **Solution**: 
  - Check browser console for errors
  - Check Network tab for failed API calls
  - Verify backend is running and accessible

**Issue: Error message appears**
- **Cause**: Backend returned an error
- **Solution**: 
  - Check the error message shown
  - Common errors:
    - "Supplier not found" - supplier ID is incorrect
    - "Supplier does not meet availability scope" - availability_scope is false
    - Network error - backend not running or CORS issue

### 6. Manual Testing via API

You can test the endpoint directly:

```bash
# Using curl
curl -X POST http://localhost:8000/api/suppliers/1/outreach

# Using browser (visit this URL after replacing {id})
http://localhost:8000/api/suppliers/1/outreach
```

Or use the Swagger UI at `http://localhost:8000/docs` to test the endpoint.

### 7. Reset and Try Again

If nothing works:
1. Stop both frontend and backend
2. Delete `backend/procurement.db` (if exists)
3. Restart backend
4. Restart frontend
5. Create a new requirement and try again

### 8. Check Logs

**Backend logs**: Check the terminal where you ran `python main.py`
- Should show: `INFO: POST /api/suppliers/{id}/outreach`
- Any errors will be displayed here

**Frontend logs**: Check browser console
- Should show: `Contacting supplier: [id] [name]`
- Any JavaScript errors will be displayed here

