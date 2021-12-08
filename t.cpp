// template <class TYPE>
// int SimpleTable<TYPE>::numRecords() const {
//     int rc = 0;                                     // 1
//     for (int i = 0;records_[i] != nullptr;i++) {    // 1 + n + n
//         rc++;                                       //n
//     }
//     return rc;                                  // 1
// }

// // NR(n)=1 + 1 + n + n + n + 1
// //     = 3n + 3

// // Therefore NR(n) is O(n)

// bool SimpleTable<TYPE>::update(const std::string& key, const TYPE& value){
//     int idx=-1;                                                                                 // 1
//     int sz=numRecords();                                                                        //1 + O(n) = 1+n
//     bool rc=true;                                                                                // 1   
//     for(int i=0;i<sz;i++){                                                                      // 1 + n + n
//         if(records_[i]->key_ == key){                                                           // n
//             idx=i;                                                                              
//         }
//     }
//     if(idx==-1){                                                                                // 1
//         if(sz < capacity_){                                                                     // 1 
//             records_[numRecords()]=new Record(key,value);                                       // O(n) + 2 op in constructor(O(1)) = O(n) + O(1)
//             for(int i=numRecords()-1;i>0 && records_[i]->key_ < records_[i-1]->key_;i--){       //1 + O(n) + 1 + (n-1) + (n-1) + (n-1) + (n-1) + (n-1)
//                 Record* tmp=records_[i];                                                        // (n-1)
//                 records_[i]=records_[i-1];                                                      // (n-1) + (n-1)
//                 records_[i-1]=tmp;                                                              // (n-1) + (n-1)
//             }
//         }
//         else{
//             rc=false;
//         }
//     }
//     else{
//         records_[idx]->data_=value;
//     }
//     return rc;                                                                                   // 1
// }

// // UPD(n)=1+1+n+1+1+n+n+n+1+1+n+1+1+n+1+(n-1)+(n-1)+(n-1)+(n-1)+(n-1)+(n-1)+(n-1)+(n-1)+(n-1)+(n-1)+1
// //     = 9 - 10 + 16n + 1
// //     = 16n
// // Therefore UPD(n) is O(n)

// bool SimpleTable<TYPE>::find(const std::string& key, TYPE& value){
//     int idx=-1;                                                         //1
//     for(int i=0;i<numRecords();i++){                                   // 1 + O(n) + O(n)= 1 + n + n
//         if(records_[i]->key_ == key){                                   // O(n)
//             idx=i;                                                      
//         }
//     }
//     if(idx==-1)                                                         //1
//         return false;                                                   //1
//     else{
//         value=records_[idx]->data_;
//         return true;
//     }
// }

// // FD(n)=1 + 1 + n + n + n + 1 + 1
// //     = 3n + 4

// // Therefore FD(n) is O(n)

// //--------------------------------------------------------------- if item is not there ----------------------------------
// bool SimpleTable<TYPE>::remove(const std::string& key){
//     int idx=-1;                                                            // 1
//     for(int i=0;records_[i]!=nullptr;i++){                                 // 1 + n + n
//         if(records_[i]->key_ == key){                                       // n
//             idx=i;                                                          
//         }
//     }
//     if(idx!=-1){                                                            // 1
//         delete records_[idx];
        
//         for(int i=idx;i<numRecords()-1;i++){
//             records_[i]=records_[i+1];
//         }
//         records_[size-1]=nullptr;
//         return true;
//     }
//     else{
//         return false;                                                       // 1
//     }
// }

// // RM(n) = 1 + 1 + n + n + n + 1 + 1
// // RM(n) = 3n + 4

// // Therefore RM(n) is O(n)

// //--------------------------------------------------------------- if item is there ----------------------------------
// bool SimpleTable<TYPE>::remove(const std::string& key){
//     int idx=-1;                                                             // 1
//     int size = numRecords();                                               // 1+O(n) = 1+n                                                         
//     for(int i=0;records_[i]!=nullptr;i++){                                 // 1 + n + n
//         if(records_[i]->key_ == key){                                       // n
//             idx=i;                                                          // 1
//         }
//     }
//     if(idx!=-1){                                                            // 1
//         delete records_[idx];                                               // 1
        
//         for(int i=idx;i<numRecords()-1;i++){                               // 1 + (n-1)*(O(n)+1) + (n-1) = 1+(n-1)*(n+1)+(n-1)
//             records_[i]=records_[i+1];                                     // (n-1)+(n-1)
//         }
//         records_[size-1]=nullptr;                                          // 1 + 1
//         return true;                                                       // 1
//     }
//     else{
//         return false;                                                       
//     }
// }

// // RM2(n) = 1 + 1 + n + 1 + n + n + n + 1 + 1 + 1 +(n-1)*(n+1)+(n-1) + (n-1)+(n-1) + 1 + 1 + 1
// // RM2(n) = 10 + n^2 - 1 + 7n - 3
// //        = n^2 + 7n + 6


// // Therefore RM2(n) is O(n^2)






// SimpleTable<TYPE>::SimpleTable(const SimpleTable<TYPE>& rhs){
//     records_=new Record*[rhs.capacity_+1];                      // 1 +O(1)+1 =1+1+1
//     capacity_=rhs.capacity_;                                    // 1
//     for(int i=0;i<capacity_+1;i++){                             // 1 + (n+1)(1+1) + n+1 = 1 + 2(n+1) + n+1
//         records_[i]=nullptr;                                    // n+1
//     }
//     for(int i=0;i<rhs.numRecords();i++){                            //1+n*(1+O(n))+n =1+n(1+n)+n = 1 + n+ n^2 + n
//         update(rhs.records_[i]->key_,rhs.records_[i]->data_);       // n*O(n) =n*n = n^2
//         //records_[i] = new Record(rhs.records_[i]->key_, rhs.records_[i]->data_);

//     }
// }

// // CYC(n) = 1 + 1 + 1 + 1 + 1 + 2(n+1) + n+1 + n+1 + 1 +n+ n^2 + n + n^2
// // CYC(n) = 5 + 5(n+1) + n + 2(n^2)
// //        = 2(n^2) + 6n + 10

// // Therefore CYC(n) is O(n^2)

// SimpleTable<TYPE>::SimpleTable(SimpleTable<TYPE>&& rhs){
//     capacity_=rhs.capacity_;                                    // 1
//     records_=rhs.records_;                                      // 1
//     rhs.records_=nullptr;                                       // 1
//     rhs.capacity_=0;                                            // 1
// }

// // MC(n) = 1 + 1 + 1 + 1
// // MC(n) = 4

// // Therefore MC(n) is O(1)

// template <class TYPE>
// const SimpleTable<TYPE>& SimpleTable<TYPE>::operator=(SimpleTable<TYPE>&& rhs){
//     if(records_){                                            // 1
//         while(numRecords() != 0){                            // n*(O(n) + 1) = n(n+1)
//             remove(records_[0]->key_);                      // O(n^2)*n = n*(n^2)
//         }
//         delete [] records_;                                 // 1
//     }
//     records_=rhs.records_;                                  // 1
//     capacity_=rhs.capacity_;                                // 1
//     rhs.records_=nullptr;                                   // 1
//     rhs.capacity_=0;                                        // 1

//     return *this;                                           // 1
// }

// // MAO(n) = 1 + n(n+1) + n*(n^2) + 6
// // MAO(n) = n^3 + n^2 + n + 7

// // Therefore MAO(n) is O(n^3)

// template <class TYPE>
// SimpleTable<TYPE>::~SimpleTable(){
//     if(records_){                                          // 1
//         int sz=numRecords();                               //1+ O(n)
//         for(int i=0;i<sz;i++){                             // 1 + n + n
//             remove(records_[0]->key_);                     // O(n^2)*n = n*(n^2)
//             //delete records_[i];                     
//             //records_[i]=nullptr;
//         }
//         delete [] records_;                                 // 1
//     }
// }

// // D(n) = 1 + 1 + n + 1 + n + n + n*(n^2) +1
// // D(n) = n^3 + 3n + 4

// // Therefore D(n) is O(n^3)

// //1. for the destructor, there is no need to call the function remove because it will cost a lot
// // instead of that we can just loop through all the records and set all the recors to "nullptr" as follow:
// //delete records_[i];
// // records_[i]=nullptr;

// //2. for the copy assignment, instead of call update function -> we can use the following code:
// //records_[i] = new Record(rhs.records_[i]->key_, rhs.records_[i]->data_); 

// //In the update function if the key doesn’t exist it will add it at the end of the array in the table 
// // and will swap it which significantly increase the run time of the function
// //since we just have to copy the table from the original object to the current object, there is no need to use
// //swap on the new copied table. We will just loop through all the elements of the other table and insert it in the new table,
// // which will cost less.

// //3. for the numRecord, instead of run for loop everytime, we can create one variable in the class and in the numRecord function,  just return it.
// //and increment size if new record is created and decrement size if record is deleted.