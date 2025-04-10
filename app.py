from flask import Flask, render_template, request, jsonify
import pandas as pd
import os
from flask_cors import CORS

# Initialize Flask app with CORS support
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def load_blood_banks():
    """Load and clean blood bank data with robust error handling"""
    try:
        # Use os.path for cross-platform compatibility
        csv_path = os.path.join('data', 'blood_banks_india.csv')
        
        # Load CSV with explicit encoding and whitespace stripping
        df = pd.read_csv(csv_path, encoding='utf-8')
        
        # Clean column names and data
        df.columns = df.columns.str.strip()
        df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)
        
        print("Successfully loaded data. Columns:", df.columns.tolist())
        return df
        
    except FileNotFoundError:
        print(f"Error: CSV file not found at {csv_path}")
        return pd.DataFrame()
    except Exception as e:
        print(f"Unexpected error loading CSV: {str(e)}")
        return pd.DataFrame()

@app.route('/')
@app.route('/blood-banks')
def blood_banks():
    """Serve the main blood bank search page"""
    return render_template('blood-banks.html')

@app.route('/search-blood-banks', methods=['POST'])
def search_blood_banks():
    """Handle blood bank search requests"""
    try:
        # Get and validate city parameter
        city = request.form.get('city', '').strip().lower()
        if not city:
            return jsonify({'error': 'City name is required'}), 400

        # Load and filter data
        df = load_blood_banks()
        if df.empty:
            return jsonify({'error': 'Blood bank database unavailable'}), 503

        # Case-insensitive search with null checks
        results = df[
            df['City'].astype(str).str.lower().str.strip() == city
        ].fillna('N/A')
        
        print(f"Found {len(results)} matches for '{city}'")
        return jsonify(results.to_dict('records'))
        
    except Exception as e:
        print(f"Search error: {str(e)}", flush=True)
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Run with enhanced configuration
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True  # Better for handling multiple requests
    )