// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract DecentraFile is Ownable {
    struct File {
        string cid;
        address uploader;
        string name;
        string description;
        string category;
        string[] tags;
        uint256 timestamp;
    }

    mapping(uint256 => File) public files;
    uint256 public fileCount;

    event FileUploaded(uint256 indexed fileId, string cid, address uploader, string name, string category, string[] tags);
    event TagsUpdated(uint256 indexed fileId, string[] newTags);

    constructor() Ownable(msg.sender) {}

    function uploadFile(string memory _cid, string memory _name, string memory _description, string memory _category, string[] memory _tags) public {
        require(bytes(_cid).length > 0, "CID cannot be empty");
        require(bytes(_name).length > 0, "File name cannot be empty");

        fileCount++;
        files[fileCount] = File(_cid, msg.sender, _name, _description, _category, _tags, block.timestamp);

        emit FileUploaded(fileCount, _cid, msg.sender, _name, _category, _tags);
    }

    function getFile(uint256 _fileId) public view returns (File memory) {
        require(_fileId > 0 && _fileId <= fileCount, "Invalid file ID");
        return files[_fileId];
    }

    function getFileCount() public view returns (uint256) {
        return fileCount;
    }

    function updateFileMetadata(uint256 _fileId, string memory _name, string memory _description, string memory _category) public {
        require(_fileId > 0 && _fileId <= fileCount, "Invalid file ID");
        require(msg.sender == files[_fileId].uploader, "Only the uploader can update file metadata");

        File storage file = files[_fileId];
        file.name = _name;
        file.description = _description;
        file.category = _category;
    }

    function updateTags(uint256 _fileId, string[] memory _newTags) public {
        require(_fileId > 0 && _fileId <= fileCount, "Invalid file ID");
        require(msg.sender == files[_fileId].uploader, "Only the uploader can update tags");

        files[_fileId].tags = _newTags;
        emit TagsUpdated(_fileId, _newTags);
    }

    function deleteFile(uint256 _fileId) public {
        require(_fileId > 0 && _fileId <= fileCount, "Invalid file ID");
        require(msg.sender == files[_fileId].uploader || msg.sender == owner(), "Only the uploader or contract owner can delete the file");

        delete files[_fileId];
    }
}
