/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.project.easykar.service;

import com.project.easykar.controller.entity.UploadFiles;

/**
 *
 * @author manoj
 */
public interface UploadFileInterface {
    boolean save(UploadFiles files);
     boolean updateProfile(UploadFiles files);
     void delete(Long Id);
     UploadFiles findByUserid(Long Id);
}
