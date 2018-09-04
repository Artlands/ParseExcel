import React, { Component }from 'react';
import XLSX from 'xlsx';
class ReadFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name:'',
      size:'',
      data: '',
      transposed:'',
      notification:'',
      process: false
    }
  }
  componentDidMount(){
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    } else {
    alert('The File APIs are not fully supported in this browser.');
    }
  };

  errorHandler = (e) => {
    switch(e.target.error.code) {
      case e.target.error.NOT_FOUND_ERR:
        this.setState({
          notification: 'File Not Found!'
        });
        break;
      case e.target.error.NOT_READABLE_ERR:
        this.setState({
          notification: 'File is not readable'
        });
        break;
      case e.target.error.ABORT_ERR:
        break;
      default:
        this.setState({
          notification: 'An error occurred reading this file.'
        });
    }
  };

  startRead = () => {
    this.setState({
      notification: 'Loading...'
    });
  }

  updateRead = (e) => {
    if(e.lengthComputable) {
      var percentLoaded = Math.round((e.loaded/e.total) * 100);
      if(percentLoaded < 100) {
        this.setState({
          notification: percentLoaded + '%'
        });
      }
    }
  };

  handleFileChosen = (e) => {
    this.setState({
      name:'',
      size:'',
      data:'',
      notification:'',
      process: false
    })

    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onerror = this.errorHandler;
    reader.onloadstart = this.startRead;
    reader.onprogress = this.updateRead(e);
    // use xlsx to read .xlsx file and convert it to json file
    reader.onload = (e) => {
      var raw = e.target.result;
      var json = XLSX.read(raw, {
        type: 'binary'
      });

      var first_worksheet = json.Sheets[json.SheetNames[0]];
      var data = XLSX.utils.sheet_to_json(first_worksheet, {header:1});

      this.setState({
        data,
        process: true,
        notification:'Read completed!'
      });
    };
    reader.readAsBinaryString(file);
    this.setState({
      name: file.name,
      size: ' - ' + file.size + ' bytes',
    });
  };

  processData = () => {
    var transposed = this.transpose(this.state.data);
    console.log(JSON.stringify(transposed));
  };

  // transpose array
  transpose(a) {
    var w = a.length || 0;
    var h = a[0] instanceof Array ? a[0].length : 0;

    if( h === 0 || w === 0) {
      return [];
    }

    var i, j, t = [];
    for( i = 0; i < h; i++) {
      t[i] = [];
      for( j = 0; j < w; j++) {
        t[i][j] = a[j][i];
      }
    }
    return t;
  }

  render() {
    return(
      <div>
        <p>{this.state.notification}</p>
        <input
          type = 'file'
          id = 'file'
          accept = '.xlsx'
          onChange = { (e) => this.handleFileChosen(e) }
        />
        <div>
          <strong>{this.state.name}</strong>
          <span>{this.state.size}</span>
        </div>
        <button disabled = {!this.state.process} onClick={() => this.processData()} >Process</button>
      </div>
    )
  }
};

export default ReadFile;